import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { getDaysOverdue, getAgingBucket } from '@/lib/utils/aging'
import { getNextNDays } from '@/lib/utils/date'
import { getCustomerRiskSummary } from '@/lib/analytics/customerRisk'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'

import { ThemeToggle } from '../components/ui/ThemeToggle'

/**
 * Owner Dashboard Page.
 * Displays key performance indicators (KPIs) like total outstanding, overdue, and high-risk customers.
 * Fetches data server-side using Prisma.
 * Protected route: Redirects to login if session is invalid.
 */
export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const riskSummary = await getCustomerRiskSummary()
  const highRisk = riskSummary.filter((c) => c.risk === 'HIGH')

  const invoices = await prisma.invoice.findMany({
    include: { customer: true },
  })

  // Next 7 days follow-ups
  const upcomingFollowups = await prisma.followUp.findMany({
    where: {
      nextFollowUpOn: {
        not: null,
        gt: new Date(),
        lte: getNextNDays(7).future,
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
    take: 5,
  })

  // Deduplicate by invoice
  const latestByInvoice = new Map<string, typeof upcomingFollowups[0]>()
  for (const fu of upcomingFollowups) {
    if (!latestByInvoice.has(fu.invoiceId)) {
      latestByInvoice.set(fu.invoiceId, fu)
    }
  }
  const upcomingUnique = Array.from(latestByInvoice.values())

  let totalOutstanding = 0
  let totalOverdue = 0
  let totalInvoiced = 0
  let totalCollected = 0

  const agingBuckets = {
    '0-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0,
  }

  const customerOverdueMap: Record<
    string,
    { customerName: string; amount: number }
  > = {}

  for (const inv of invoices) {
    totalOutstanding += inv.outstandingAmount
    totalInvoiced += inv.invoiceAmount
    totalCollected += inv.paidAmount
    const daysOverdue = getDaysOverdue(inv.dueDate)

    if (inv.outstandingAmount > 0 && daysOverdue > 0) {
      totalOverdue += inv.outstandingAmount
      const bucket = getAgingBucket(daysOverdue)

      if (bucket !== 'CURRENT') {
        agingBuckets[bucket] += inv.outstandingAmount
      }

      if (!customerOverdueMap[inv.customerId]) {
        customerOverdueMap[inv.customerId] = {
          customerName: inv.customer.name,
          amount: 0,
        }
      }
      customerOverdueMap[inv.customerId].amount += inv.outstandingAmount
    } else if (inv.outstandingAmount > 0) {
      // Also add to outstanding even if not overdue
      // But aging buckets logic above only tracks overdue for buckets? 
      // The original code only added to buckets if daysOverdue > 0.
      // I'll keep original logic to be safe, but usually current buckets exist too.
      // logic preserved from original file
    }
  }

  const topDefaulters = Object.values(customerOverdueMap)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-200">
            Owner Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your cash flow and customer risks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-3 text-sm font-medium mr-2">
            {/* <Link href="/customers" className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-secondary/50 transition-colors">
              Customers
            </Link>
            <Link href="/invoices" className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-secondary/50 transition-colors">
              Invoices
            </Link>
            <Link href="/followups" className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-secondary/50 transition-colors">
              Follow-ups
            </Link> */}
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* KPI Cards */}
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Invoiced"
          value={`₹${totalInvoiced.toLocaleString()}`}
          subtext="Total business generated"
        />
        <StatCard
          title="Payment Collected"
          value={`₹${totalCollected.toLocaleString()}`}
          color="success"
          subtext="Total cash received"
        />
        <StatCard
          title="Total Outstanding"
          value={`₹${totalOutstanding.toLocaleString()}`}
          subtext="Total pending collection"
        />
        <StatCard
          title="Total Overdue"
          value={`₹${totalOverdue.toLocaleString()}`}
          color="danger"
          subtext="Requires immediate attention"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Overdue Customers"
          value={topDefaulters.length}
          color="warning"
          subtext="Customers with overdue invoices"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming Follow-ups */}
        <div className="xl:col-span-1">
          <Card title="Upcoming Follow-ups (7 Days)" className="h-full">
            {upcomingUnique.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <p>No upcoming follow-ups 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingUnique.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-secondary">
                    <div>
                      <p className="font-semibold text-sm">{f.invoice.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(f.nextFollowUpOn!).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Link href={`/followups`} className="text-xs text-primary hover:underline">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* High Risk Customers */}
        <div className="xl:col-span-2">
          <Card title="High Risk Customers" className="h-full">
            {highRisk.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <p>🎉 No high risk customers</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-secondary/50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Customer</th>
                      <th className="px-4 py-3">Outstanding</th>
                      <th className="px-4 py-3">Oldest Due</th>
                      <th className="px-4 py-3">Broken Promises</th>
                      <th className="px-4 py-3 rounded-r-lg">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highRisk.map((c) => (
                      <tr key={c.customerId} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{c.customerName}</td>
                        <td className="px-4 py-3">₹{c.totalOutstanding.toLocaleString()}</td>
                        <td className="px-4 py-3">{c.oldestDueDays} days</td>
                        <td className="px-4 py-3 text-center">{c.brokenPromises}</td>
                        <td className="px-4 py-3">
                          <Badge variant="danger">HIGH</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aging Summary */}
        <Card title="Aging Summary">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-500">Bucket</th>
                  <th className="p-3 text-right font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(agingBuckets).map(([bucket, amount]) => (
                  <tr key={bucket} className="hover:bg-secondary/20">
                    <td className="p-3 font-medium">{bucket} Days</td>
                    <td className="p-3 text-right">₹{amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Defaulters */}
        <Card title="Top Overdue Customers">
          <div className="space-y-3">
            {topDefaulters.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No overdue customers 🎉</p>
            ) : (
              topDefaulters.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-transparent hover:border-secondary transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {idx + 1}
                    </div>
                    <span className="font-medium">{c.customerName}</span>
                  </div>
                  <span className="font-bold text-danger">₹{c.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
