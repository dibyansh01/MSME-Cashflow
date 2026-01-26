import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { createInvoice } from '../actions'
import Link from 'next/link'

export default async function NewInvoicePage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">New Invoice</h1>

      <form action={createInvoice} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Customer *
          </label>
          <select
            name="customerId"
            required
            className="border p-2 w-full rounded"
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Invoice Number *
          </label>
          <input
            name="invoiceNo"
            required
            className="border p-2 w-full rounded"
            placeholder="INV-1001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Invoice Date *
          </label>
          <input
            name="invoiceDate"
            type="date"
            required
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Invoice Amount *
          </label>
          <input
            name="invoiceAmount"
            type="number"
            step="0.01"
            required
            className="border p-2 w-full rounded"
            placeholder="50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Paid Amount *
          </label>
          <input
            name="paidAmount"
            type="number"
            step="0.01"
            required
            className="border p-2 w-full rounded"
            placeholder="50000"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save Invoice
          </button>

          <Link
            href="/invoices"
            className="px-4 py-2 border rounded"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
