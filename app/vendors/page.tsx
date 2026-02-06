import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Pagination } from '@/app/components/ui/Pagination'
import { Search } from '@/app/components/ui/Search'
import { Badge } from '@/app/components/ui/Badge'
import { ExportButton } from '@/app/components/ui/ExportButton'

/**
 * Vendors List Page.
 * Displays a list of all vendors with contact details and status.
 * Supports server-side pagination and search.
 */
export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const { page, q } = await searchParams
  const currentPage = Number(page || '1')
  const pageSize = 10
  const query = q || ''

  const whereClause: any = query
    ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ],
    }
    : {}

  // Parallel fetch: data + count
  const [vendors, totalCount] = await Promise.all([
    prisma.vendor.findMany({
      where: whereClause,
      include: {
        supplierInvoices: {
          select: {
            dueDate: true,
            outstandingAmount: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vendor.count({ where: whereClause }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Search placeholder="Search vendors..." />
          <ExportButton entity="vendors" />
          <Link
            href="/vendors/new"
            className="flex-shrink-0 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            + New
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Credit Terms</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vendors.map((v) => (
              <tr key={v.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">
                  <Link
                    href={`/supplier-invoices?q=${encodeURIComponent(v.name)}`}
                    className="text-primary hover:underline"
                  >
                    {v.name}
                  </Link>
                </td>
                <td className="p-3">
                  {(() => {
                    const invoices = v.supplierInvoices || []
                    const hasInvoices = invoices.length > 0

                    if (!hasInvoices) {
                      return <Badge variant="secondary">New</Badge>
                    }

                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    const hasOverdue = invoices.some(
                      (inv) => inv.outstandingAmount > 0 && new Date(inv.dueDate) < today
                    )

                    if (hasOverdue) {
                      return <Badge variant="danger">Overdue</Badge>
                    }

                    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0)

                    if (totalOutstanding > 0) {
                      return <Badge variant="warning">Pending</Badge>
                    }

                    return <Badge variant="success">Paid</Badge>
                  })()}
                </td>
                <td className="p-3">{v.phone || '-'}</td>
                <td className="p-3">{v.email || '-'}</td>
                <td className="p-3">
                  {v.creditTerms ? `${v.creditTerms} days` : '-'}
                </td>
                <td className="p-3">
                  {new Date(v.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td className="p-8 text-center text-muted-foreground" colSpan={6}>
                  No vendors found
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