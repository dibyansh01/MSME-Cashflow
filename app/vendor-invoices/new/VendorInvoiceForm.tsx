import { useFormState } from 'react-dom'
import { createVendorInvoice, type VendorInvoiceFormState } from '../actions'

export default function VendorInvoiceForm({ vendors }: { vendors: { id: string; name: string }[] }) {
    const initialState: VendorInvoiceFormState = {
        message: '',
        error: '',
    }

    const [state, formAction] = useFormState(createVendorInvoice, initialState)

    return (
        <form action={formAction} className="space-y-4 bg-card p-6 rounded-lg border shadow-sm">
            {state.error && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                    {state.error}
                </div>
            )}
            {state.message && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                    {state.message}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Vendor</label>
                <select name="vendorId" required className="w-full p-2 border rounded-md bg-background">
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>
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
                    placeholder="0"
                    defaultValue="0"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded"
                >
                    Save Vendor Invoice
                </button>

                <Link
                    href="/vendor-invoices"
                    className="px-4 py-2 border rounded"
                >
                    Back to List
                </Link>
            </div>
        </form>
    )
}
