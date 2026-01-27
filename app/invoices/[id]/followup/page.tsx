import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { createFollowUp } from './actions'

export default async function FollowUpPage({
  params,
}: {
  params:  Promise<{ id: string }>
}) {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const { id } = await params
  if (!id) {
    return <div className="p-6">Invalid invoice ID</div>
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">
        Add Follow-up
      </h1>

      <form action={createFollowUp} className="space-y-4">
        <input type="hidden" name="invoiceId" value={id} />

        <div>
          <label className="block text-sm mb-1">
            Method
          </label>
          <select name="method" className="border p-2 w-full">
            <option value="CALL">Call</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">Email</option>
            <option value="VISIT">Visit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Status
          </label>
          <select name="status" className="border p-2 w-full">
            <option value="PROMISED">Promised to pay</option>
            <option value="NO_RESPONSE">No response</option>
            <option value="PAID">Paid</option>
            <option value="DISPUTED">Disputed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            Next Follow-up Date
          </label>
          <input
            type="date"
            name="nextFollowUpOn"
            className="border p-2 w-full"
          />
        </div>

        <button className="bg-black text-white px-4 py-2 rounded">
          Save Follow-up
        </button>
      </form>
    </div>
  )
}
