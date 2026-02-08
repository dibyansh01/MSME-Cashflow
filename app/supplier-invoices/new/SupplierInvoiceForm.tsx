'use client'

import { useFormState } from 'react-dom'
import { createSupplierInvoice, type SupplierInvoiceFormState } from '../actions'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function SupplierInvoiceForm({ vendors }: { vendors: { id: string; name: string }[] }) {
    const initialState: SupplierInvoiceFormState = {
        error: undefined,
        success: false,
    }

    const [state, formAction] = useFormState(createSupplierInvoice, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset()
        }
    }, [state.success])

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            {state.error && (
                <div className="bg-yellow-50 border border-yellow-300 p-2 text-sm text-yellow-800 rounded">
                    ⚠ {state.error}
                </div>
            )}

            {state.success && (
                <div className="bg-green-50 border border-green-300 p-2 text-sm text-green-800 rounded">
                    ✅ Supplier Invoice saved successfully
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">
                    Vendor *
                </label>
                <select
                    name="vendorId"
                    required
                    className="border p-2 w-full rounded"
                >
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
                    placeholder="0"
                    defaultValue="0"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded"
                >
                    Save Supplier Invoice
                </button>

                <Link
                    href="/supplier-invoices"
                    className="px-4 py-2 border rounded"
                >
                    Back to List
                </Link>
            </div>
        </form>
    )
}
