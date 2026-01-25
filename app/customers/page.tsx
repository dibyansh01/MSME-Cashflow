import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

export default async function CustomersPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link
          href="/customers/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + New Customer
        </Link>
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Credit Terms</th>
              <th className="text-left p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2 font-medium">{c.name}</td>
                <td className="p-2">{c.phone || '-'}</td>
                <td className="p-2">{c.email || '-'}</td>
                <td className="p-2">
                  {c.creditTerms ? `${c.creditTerms} days` : '-'}
                </td>
                <td className="p-2">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={5}>
                  No customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
