import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { createCustomer } from '../actions'
import Link from 'next/link'

export default async function NewCustomerPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Customer</h1>
        <p className="text-sm text-gray-500">
          Add a customer for invoicing and follow-ups
        </p>
      </div>

      <form action={createCustomer} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Customer Name *
          </label>
          <input
            name="name"
            required
            className="border p-2 w-full rounded"
            placeholder="ABC Pharma Distributors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Phone
          </label>
          <input
            name="phone"
            className="border p-2 w-full rounded"
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            className="border p-2 w-full rounded"
            placeholder="accounts@abcpharma.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Credit Terms (days)
          </label>
          <input
            name="creditTerms"
            type="number"
            className="border p-2 w-full rounded"
            placeholder="30"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save Customer
          </button>

          <Link
            href="/customers"
            className="px-4 py-2 border rounded"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
