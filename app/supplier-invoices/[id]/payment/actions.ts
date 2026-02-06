'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addSupplierPayment(
    prevState: { error?: string } | null,
    formData: FormData
) {
    const supplierInvoiceId = formData.get('invoiceId') as string
    const amountStr = formData.get('amount') as string
    const method = formData.get('method') as string
    const reference = formData.get('reference') as string
    const notes = formData.get('notes') as string
    const paymentDateStr = formData.get('paymentDate') as string

    const amount = Number(amountStr)
    const paymentDate = new Date(paymentDateStr)

    if (!supplierInvoiceId || !amount || amount <= 0) {
        return { error: 'Please enter a valid payment amount' }
    }

    if (isNaN(paymentDate.getTime())) {
        return { error: 'Please select a valid payment date' }
    }

    const invoice = await prisma.supplierInvoice.findUnique({
        where: { id: supplierInvoiceId },
        include: { payments: true },
    })

    if (!invoice) {
        return { error: 'Supplier Invoice not found' }
    }

    const totalPaidSoFar = invoice.payments.reduce(
        (sum, p) => sum + p.amount,
        0
    )

    const newTotalPaid = totalPaidSoFar + amount

    if (newTotalPaid > invoice.invoiceAmount) {
        return {
            error: `Payment exceeds outstanding balance. Outstanding is ₹${invoice.outstandingAmount.toLocaleString()}`,
        }
    }

    const newOutstanding =
        invoice.invoiceAmount - newTotalPaid

    let newStatus: 'UNPAID' | 'PARTIAL' | 'PAID' = 'UNPAID'

    if (newOutstanding === 0) {
        newStatus = 'PAID'
    } else if (newTotalPaid > 0) {
        newStatus = 'PARTIAL'
    }

    await prisma.$transaction([
        prisma.supplierPayment.create({
            data: {
                supplierInvoiceId,
                amount,
                method,
                reference,
                notes,
                paymentDate,
            },
        }),

        prisma.supplierInvoice.update({
            where: { id: supplierInvoiceId },
            data: {
                paidAmount: newTotalPaid,
                outstandingAmount: newOutstanding,
                status: newStatus,
            },
        }),
    ])

    revalidatePath(`/supplier-invoices/${supplierInvoiceId}`)
    revalidatePath('/supplier-invoices')
    revalidatePath('/dashboard')

    return { success: true, message: 'Payment recorded successfully!' }
}
