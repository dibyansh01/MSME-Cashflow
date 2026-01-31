import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

/**
 * Invoices List Page.
 * Displays a table of all invoices with their status (Paid, Unpaid, Overdue, Partial).
 * Allows navigation to individual invoice details.
 * Fetches data server-side.
 */
export default async function InvoicesPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const invoices = await prisma.invoice.findMany({
    include: { customer: true },
    orderBy: { dueDate: 'asc' },
  })

  const today = new Date()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link
          href="/invoices/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + New Invoice
        </Link>
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Invoice #</th>
              <th className="text-left p-2">Customer</th>
              <th className="text-left p-2">Invoice Date</th>
              <th className="text-left p-2">Due Date</th>
              <th className="text-left p-2">Invoice Amount</th>
              <th className="text-left p-2">Outstanding</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv) => {
              const isOverdue =
                inv.outstandingAmount > 0 && inv.dueDate < today

              let displayStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' =
                'UNPAID'

              if (inv.outstandingAmount === 0) {
                displayStatus = 'PAID'
              } else if (isOverdue) {
                displayStatus = 'OVERDUE'
              } else if (inv.paidAmount > 0) {
                displayStatus = 'PARTIAL'
              } else {
                displayStatus = 'UNPAID'
              }

              return (
                <tr key={inv.id} className="border-t">
                  <td className="p-2">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-blue-600 underline"
                    >
                      {inv.invoiceNo}
                    </Link>
                  </td>
                  <td className="p-2">{inv.customer.name}</td>
                  <td className="p-2">
                    {new Date(inv.invoiceDate).toLocaleDateString()}
                  </td>

                  <td className="p-2">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    ₹{inv.invoiceAmount.toLocaleString()}
                  </td>
                  <td className="p-2">
                    ₹{inv.outstandingAmount.toLocaleString()}
                  </td>
                  <td className="p-2">
                    {displayStatus === 'OVERDUE' && (
                      <span className="text-red-600 font-medium">
                        OVERDUE
                      </span>
                    )}

                    {displayStatus === 'PAID' && (
                      <span className="text-green-700 font-medium">
                        PAID
                      </span>
                    )}

                    {displayStatus === 'PARTIAL' && (
                      <span className="text-orange-600 font-medium">
                        PARTIAL
                      </span>
                    )}

                    {displayStatus === 'UNPAID' && (
                      <span className="text-gray-700">
                        UNPAID
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}

            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center text-gray-500"
                >
                  No invoices yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
