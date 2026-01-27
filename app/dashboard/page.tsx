import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { getDaysOverdue, getAgingBucket } from '@/lib/utils/aging'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const invoices = await prisma.invoice.findMany({
    include: { customer: true },
  })

  let totalOutstanding = 0
  let totalOverdue = 0

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

      customerOverdueMap[inv.customerId].amount +=
        inv.outstandingAmount
    }
  }

  const topDefaulters = Object.values(customerOverdueMap)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>

        <div className="flex gap-4">
          <Link href="/customers" className="underline">
            Customers
          </Link>
          <Link href="/invoices" className="underline">
            Invoices
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Total Outstanding
          </div>
          <div className="text-2xl font-bold">
            ₹{totalOutstanding.toLocaleString()}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Total Overdue
          </div>
          <div className="text-2xl font-bold text-red-600">
            ₹{totalOverdue.toLocaleString()}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Overdue Customers
          </div>
          <div className="text-2xl font-bold">
            {topDefaulters.length}
          </div>
        </div>
      </div>

      {/* Aging Buckets */}
      <div className="border rounded p-4">
        <h2 className="font-bold mb-3">Aging Summary</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Bucket</th>
              <th className="text-left p-2">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">0–30 Days</td>
              <td className="p-2">
                ₹{agingBuckets['0-30'].toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="p-2">31–60 Days</td>
              <td className="p-2">
                ₹{agingBuckets['31-60'].toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="p-2">61–90 Days</td>
              <td className="p-2">
                ₹{agingBuckets['61-90'].toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="p-2">90+ Days</td>
              <td className="p-2">
                ₹{agingBuckets['90+'].toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Top Defaulters */}
      <div className="border rounded p-4">
        <h2 className="font-bold mb-3">
          Top Overdue Customers
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Customer</th>
              <th className="text-left p-2">Overdue Amount</th>
            </tr>
          </thead>
          <tbody>
            {topDefaulters.map((c, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{c.customerName}</td>
                <td className="p-2 text-red-600 font-medium">
                  ₹{c.amount.toLocaleString()}
                </td>
              </tr>
            ))}

            {topDefaulters.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="p-4 text-center text-gray-500"
                >
                  No overdue customers 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
