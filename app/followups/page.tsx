import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { getNextNDays } from '@/lib/utils/date'
import { getReminderMessage } from '@/lib/collections/messageTemplates'
import WhatsAppActions from '@/components/WhatsAppActions'
import { Pagination } from '@/app/components/ui/Pagination'
import { Badge } from '@/app/components/ui/Badge'

/**
 * Follow-ups Queue Page ("Collections").
 * Displays a prioritized list of invoices requiring attention.
 * Implements server-side pagination efficiently by sorting at the Database level.
 * Priority: Overdue invoices first, then earliest follow-up date.
 */
import { Search } from '@/app/components/ui/Search'
import { Filter } from '@/app/components/ui/Filter'

// ...

export default async function FollowupsQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>
}) {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const { page, q, status } = await searchParams
  const currentPage = Number(page || '1')
  const pageSize = 10
  const query = q || ''
  const filterStatus = status || ''

  // --- PURE DATES ---
  const today = getNextNDays(7).now
  today.setHours(0, 0, 0, 0)

  const next7Days = getNextNDays(7).future

  // --- PAGINATED QUERY ---
  const whereClause: any = {
    AND: [
      {
        invoice: {
          outstandingAmount: { gt: 0 },
        },
      },
      {
        OR: [
          { nextFollowUpOn: { lte: next7Days } },
          {
            invoice: {
              dueDate: { lt: today },
            },
          },
        ],
      }
    ],
  }

  // Apply Search
  if (query) {
    whereClause.AND.push({
      invoice: {
        customer: {
          name: { contains: query, mode: 'insensitive' }
        }
      }
    })
  }

  // Apply Filter
  if (filterStatus) {
    whereClause.AND.push({
      status: { equals: filterStatus, mode: 'insensitive' }
    })
  }

  const [followUps, totalCount] = await Promise.all([
    prisma.followUp.findMany({
      where: whereClause,
      include: {
        invoice: {
          include: { customer: true },
        },
      },
      orderBy: [
        { nextFollowUpOn: 'asc' }, // Earliest attention needed first
        { createdAt: 'desc' }      // Tie-breaker
      ],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.followUp.count({ where: whereClause }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Collections Queue</h1>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Search placeholder="Search customer..." />
          <Filter
            paramName="status"
            label="Last Status"
            options={[
              { label: 'Promised', value: 'PROMISED' },
              { label: 'No Response', value: 'NO_RESPONSE' },
              { label: 'Disputed', value: 'DISPUTED' },
            ]}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="p-3 text-left font-medium text-muted-foreground">Customer</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Invoice</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Outstanding</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Due Date</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Method</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Last Status</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Next Follow-up</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Action</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Reminder Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {followUps.map((fu) => {
              const inv = fu.invoice
              const overdue = inv.dueDate < today

              return (
                <tr key={fu.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-medium">
                    {inv.customer.name}
                  </td>

                  <td className="p-3">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-primary hover:underline"
                    >
                      {inv.invoiceNo}
                    </Link>
                  </td>

                  <td className="p-3 font-medium">
                    ₹{inv.outstandingAmount.toLocaleString()}
                  </td>

                  <td className="p-3">
                    <span className={overdue ? 'text-red-500 font-medium' : ''}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="p-3">{fu.method}</td>
                  <td className="p-3">
                    {(() => {
                      const status = fu.status
                      const variant =
                        status === 'PAID'
                          ? 'success'
                          : status === 'DISPUTED'
                            ? 'danger'
                            : status === 'NO_RESPONSE'
                              ? 'warning'
                              : 'default'

                      return <Badge variant={variant}>{status}</Badge>
                    })()}
                  </td>

                  <td className="p-3">
                    {fu.nextFollowUpOn
                      ? new Date(fu.nextFollowUpOn).toLocaleDateString()
                      : '-'}
                  </td>

                  <td className="p-3 space-x-2">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-primary hover:underline text-xs font-medium"
                    >
                      View
                    </Link>
                    <Link
                      href={`/invoices/${inv.id}/followup`}
                      className="text-primary hover:underline text-xs font-medium"
                    >
                      Follow-up
                    </Link>
                    <Link
                      href={`/invoices/${inv.id}/payment`}
                      className="text-primary hover:underline text-xs font-medium"
                    >
                      Payment
                    </Link>
                  </td>
                  <td className="p-3">
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
                        <div className="space-y-2 min-w-[250px]">
                          <textarea
                            readOnly
                            value={message}
                            className="w-full text-xs p-2 rounded border bg-muted/50 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none"
                          />
                          <WhatsAppActions message={message} />
                        </div>
                      )
                    })()}
                  </td>

                </tr>
              )
            })}

            {followUps.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">
                  🎉 No pending collections — you’re all clear!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
