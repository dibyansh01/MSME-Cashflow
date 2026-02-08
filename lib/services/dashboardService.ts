import { prisma } from '@/lib/db/prisma';
import { getNextNDays } from '@/lib/utils/date';
import { getCustomerRiskSummary } from '@/lib/analytics/customerRisk';
import { getDaysOverdue, getAgingBucket } from '@/lib/utils/aging';

export interface DateRange {
    from: Date;
    to: Date;
}

export async function getDashboardData(range?: DateRange) {
    // Default to Next 30 Days if no range provided
    const defaultRange = getNextNDays(30);
    const from = range?.from || new Date(); // Today
    const to = range?.to || defaultRange.future;

    // Ensure 'to' is end of day for inclusive filtering
    const toEndOfDay = new Date(to);
    toEndOfDay.setHours(23, 59, 59, 999);

    const fromStartOfDay = new Date(from);
    fromStartOfDay.setHours(0, 0, 0, 0);

    // ============================================
    // 1. CASH-IN SNAPSHOT (HISTORICAL / TOTALS)
    // ============================================

    const invoices = await prisma.invoice.findMany({
        include: { customer: true },
    });

    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;

    const agingBuckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    const customerOverdueMap: Record<string, { customerName: string; amount: number }> = {};

    for (const inv of invoices) {
        totalInvoiced += inv.invoiceAmount;
        totalCollected += inv.paidAmount;
        totalOutstanding += inv.outstandingAmount;

        if (inv.outstandingAmount > 0) {
            const daysOverdue = getDaysOverdue(inv.dueDate);

            if (daysOverdue > 0) {
                totalOverdue += inv.outstandingAmount;

                const bucket = getAgingBucket(daysOverdue);
                if (bucket !== 'CURRENT') {
                    agingBuckets[bucket] += inv.outstandingAmount;
                }

                if (!customerOverdueMap[inv.customerId]) {
                    customerOverdueMap[inv.customerId] = {
                        customerName: inv.customer.name,
                        amount: 0,
                    };
                }
                customerOverdueMap[inv.customerId].amount += inv.outstandingAmount;
            }
        }
    }

    const topDefaulters = Object.values(customerOverdueMap)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    const overdueCustomersCount = Object.keys(customerOverdueMap).length;


    // ============================================
    // 2. CASH-OUT & NET CASH (HISTORICAL / TOTALS)
    // ============================================

    const expenses = await prisma.expense.aggregate({
        _sum: { amount: true },
    });
    const totalExpenseAmount = expenses._sum.amount || 0;

    const supplierPayments = await prisma.supplierPayment.aggregate({
        _sum: { amount: true },
    });
    const totalSupplierPaymentAmount = supplierPayments._sum.amount || 0;

    const totalCashOut = totalExpenseAmount + totalSupplierPaymentAmount;
    const netCashPosition = totalCollected - totalCashOut;


    // ============================================
    // 3. VENDOR PAYABLES
    // ============================================
    const supplierInvoices = await prisma.supplierInvoice.findMany();

    let totalVendorOutstanding = 0;
    let totalVendorOverdue = 0;

    for (const sinv of supplierInvoices) {
        totalVendorOutstanding += sinv.outstandingAmount;
        if (sinv.outstandingAmount > 0) {
            const isOverdue = new Date() > sinv.dueDate;
            if (isOverdue) {
                totalVendorOverdue += sinv.outstandingAmount;
            }
        }
    }

    // ============================================
    // 4. SMART CASH FLOW (ACTUALS + PROJECTIONS)
    // ============================================

    // Split range into Past (< Today) and Future (>= Today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let pastInflows = 0;
    let pastOutflows = 0;
    let futureInflows = 0;
    let futureOutflows = 0;

    // --- PAST: ACTUALS ---
    if (fromStartOfDay < todayStart) {
        const pastEnd = toEndOfDay < todayStart ? toEndOfDay : new Date(todayStart.getTime() - 1);

        // Collections (In)
        const collections = await prisma.paymentEntry.aggregate({
            _sum: { amount: true },
            where: {
                paymentDate: {
                    gte: fromStartOfDay,
                    lte: pastEnd
                }
            }
        });
        pastInflows = collections._sum.amount || 0;

        // Expenses + SupplierPayments (Out)
        const expenseSum = await prisma.expense.aggregate({
            _sum: { amount: true },
            where: {
                expenseDate: {
                    gte: fromStartOfDay,
                    lte: pastEnd
                }
            }
        });
        const supplierPaymentSum = await prisma.supplierPayment.aggregate({
            _sum: { amount: true },
            where: {
                paymentDate: {
                    gte: fromStartOfDay,
                    lte: pastEnd
                }
            }
        });
        pastOutflows = (expenseSum._sum.amount || 0) + (supplierPaymentSum._sum.amount || 0);
    }

    // --- FUTURE: PROJECTIONS ---
    if (toEndOfDay >= todayStart) {
        const futureStart = fromStartOfDay > todayStart ? fromStartOfDay : todayStart;

        // Expected Inflows (Customer Invoices Due)
        const expectedIn = await prisma.invoice.aggregate({
            _sum: { outstandingAmount: true },
            where: {
                outstandingAmount: { gt: 0 },
                dueDate: {
                    gte: futureStart,
                    lte: toEndOfDay
                }
            }
        });
        futureInflows = expectedIn._sum.outstandingAmount || 0;

        // Expected Outflows (Supplier Invoices Due)
        const expectedOut = await prisma.supplierInvoice.aggregate({
            _sum: { outstandingAmount: true },
            where: {
                outstandingAmount: { gt: 0 },
                dueDate: {
                    gte: futureStart,
                    lte: toEndOfDay
                }
            }
        });
        futureOutflows = expectedOut._sum.outstandingAmount || 0;
    }

    const totalInflows = pastInflows + futureInflows;
    const totalOutflows = pastOutflows + futureOutflows;
    const netCashFlow = totalInflows - totalOutflows;

    // ============================================
    // 5. OPERATIONAL (Follow-ups & Risk)
    // ============================================

    // Follow-ups falling in the requested range
    const upcomingFollowups = await prisma.followUp.findMany({
        where: {
            nextFollowUpOn: {
                not: null,
                gte: fromStartOfDay,
                lte: toEndOfDay,
            },
            invoice: {
                outstandingAmount: { gt: 0 },
            },
        },
        include: {
            invoice: {
                include: { customer: true },
            },
        },
        orderBy: { nextFollowUpOn: 'asc' },
        take: 10,
    });

    const latestByInvoice = new Map<string, typeof upcomingFollowups[0]>()
    for (const fu of upcomingFollowups) {
        if (!latestByInvoice.has(fu.invoiceId)) {
            latestByInvoice.set(fu.invoiceId, fu)
        }
    }
    const upcomingUnique = Array.from(latestByInvoice.values());

    const riskSummary = await getCustomerRiskSummary();
    const highRiskCustomers = riskSummary.filter((c) => c.risk === 'HIGH');

    return {
        snapshot: {
            totalInvoiced,
            totalCollected,
            totalOutstanding,
            totalOverdue,
            overdueCustomersCount
        },
        cashOut: {
            totalCashOut,
            netCashPosition,
            vendorPayables: totalVendorOutstanding,
            vendorOverdue: totalVendorOverdue
        },
        cashFlow: {
            pastInflows,
            pastOutflows,
            futureInflows,
            futureOutflows,
            totalInflows,
            totalOutflows,
            net: netCashFlow,
        },
        operational: {
            upcomingFollowups: upcomingUnique,
            highRiskCustomers,
            agingBuckets,
            topDefaulters
        }
    };
}
