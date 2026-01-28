'use client'

import { useFormState } from 'react-dom'
import { addPayment } from './actions'

export default function PaymentForm({
  invoiceId,
}: {
  invoiceId: string
}) {
  const [state, formAction] = useFormState(addPayment, null)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="invoiceId" value={invoiceId} />

      {/* Error Message */}
      {state?.error && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded text-sm">
          ⚠️ {state.error}
        </div>
      )}

      {/* Payment Date */}
      <div>
        <label className="block text-sm mb-1">
          Payment Date *
        </label>
        <input
          name="paymentDate"
          type="date"
          required
          className="border p-2 w-full"
          defaultValue={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm mb-1">
          Amount Received *
        </label>
        <input
          name="amount"
          type="number"
          step="0.01"
          required
          className="border p-2 w-full"
          placeholder="5000"
        />
      </div>

      {/* Method */}
      <div>
        <label className="block text-sm mb-1">
          Payment Method
        </label>
        <select
          name="method"
          className="border p-2 w-full"
        >
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="BANK">Bank Transfer</option>
          <option value="CHEQUE">Cheque</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Reference */}
      <div>
        <label className="block text-sm mb-1">
          Reference
        </label>
        <input
          name="reference"
          className="border p-2 w-full"
          placeholder="UTR / Cheque no"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          className="border p-2 w-full"
        />
      </div>

      <button className="bg-black text-white px-4 py-2 rounded">
        Save Payment
      </button>
    </form>
  )
}
