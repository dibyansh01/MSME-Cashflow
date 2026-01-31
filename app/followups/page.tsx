import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { getNextNDays } from '@/lib/utils/date'
import { getReminderMessage } from '@/lib/collections/messageTemplates'
import CopyButton from '@/components/copyButton'
import WhatsAppActions from '@/components/WhatsAppActions'




/**
 * Follow-ups Queue Page ("Collections").
 * Displays a prioritized list of invoices requiring attention (overdue or scheduled follow-up).
 * Implements a smart sorting algorithm:
 * 1. Overdue invoices first.
 * 2. Scheduled follow-ups by date (earliest first).
 * 3. Highest outstanding amount first.
 * Deduplicates multiple follow-ups for the same invoice, showing the latest one.
 */
export default async function FollowupsQueuePage() {
  const session = await getServerSession()
  if (!session) redirect('/login')

  // --- PURE DATES (BEST PRACTICE) ---
  const today = getNextNDays(7).now
  today.setHours(0, 0, 0, 0)

  const next7Days = getNextNDays(7).future


  // --- FETCH FOLLOW-UPS (RAW) ---
  const followUps = await prisma.followUp.findMany({
    where: {
      invoice: {
        outstandingAmount: { gt: 0 },
      },
      OR: [
        { nextFollowUpOn: { lte: next7Days } },
        {
          invoice: {
            dueDate: { lt: today },
          },
        },
      ],
    },
    include: {
      invoice: {
        include: { customer: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // --- DEDUPE: LATEST FOLLOW-UP PER INVOICE ---
  const latestByInvoice = new Map<string, typeof followUps[0]>()

  for (const fu of followUps) {
    if (!latestByInvoice.has(fu.invoiceId)) {
      latestByInvoice.set(fu.invoiceId, fu)
    }
  }

  const queue = Array.from(latestByInvoice.values())

  // --- SMART PRIORITY SORTING ---
  queue.sort((a, b) => {
    const aOverdue = a.invoice.dueDate < today
    const bOverdue = b.invoice.dueDate < today

    if (aOverdue !== bOverdue) {
      return aOverdue ? -1 : 1
    }

    const aNext = a.nextFollowUpOn?.getTime() || 0
    const bNext = b.nextFollowUpOn?.getTime() || 0

    if (aNext !== bNext) {
      return aNext - bNext
    }

    return b.invoice.outstandingAmount - a.invoice.outstandingAmount
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Collections Queue
      </h1>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Invoice</th>
              <th className="p-2 text-left">Outstanding</th>
              <th className="p-2 text-left">Due Date</th>
              <th className="p-2 text-left">Method</th>
              <th className="p-2 text-left">Last Status</th>
              <th className="p-2 text-left">Next Follow-up</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Reminder Message</th>

            </tr>
          </thead>
          <tbody>
            {queue.map((fu) => {
              const inv = fu.invoice
              const overdue = inv.dueDate < today

              return (
                <tr key={fu.id} className="border-t">
                  <td className="p-2">
                    {inv.customer.name}
                  </td>

                  <td className="p-2">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-blue-600 underline"
                    >
                      {inv.invoiceNo}
                    </Link>
                  </td>

                  <td className="p-2 font-medium">
                    ₹{inv.outstandingAmount.toLocaleString()}
                  </td>

                  <td className="p-2">
                    <span className={overdue ? 'text-red-600' : ''}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="p-2">{fu.method}</td>
                  <td className="p-2">{fu.status}</td>

                  <td className="p-2">
                    {fu.nextFollowUpOn
                      ? new Date(fu.nextFollowUpOn).toLocaleDateString()
                      : '-'}
                  </td>

                  <td className="p-2 space-x-2">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-blue-600 underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/invoices/${inv.id}/followup`}
                      className="text-blue-600 underline"
                    >
                      Follow-up
                    </Link>
                    <Link
                      href={`/invoices/${inv.id}/payment`}
                      className="text-blue-600 underline"
                    >
                      Payment
                    </Link>
                  </td>
                  <td className="p-2">
                    {(() => {
                      const daysOverdue = Math.floor(
                        (new Date().getTime() - new Date(inv.dueDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )

                      const message = getReminderMessage({
                        customerName: inv.customer.name,
                        invoiceNo: inv.invoiceNo,
                        amount: inv.outstandingAmount,
                        dueDate: new Date(inv.dueDate),
                        daysOverdue,
                      })

                      return (
                        <div className="space-y-1">
                          <textarea
                            readOnly
                            value={message}
                            className="border p-2 w-full text-xs rounded"
                            rows={3}
                          />

                        
                          <WhatsAppActions message={message} />
                        </div>
                      )
                    })()}
                  </td>

                </tr>
              )
            })}

            {queue.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  🎉 No pending collections — you’re all clear!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
