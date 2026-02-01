'use client'

import { useFormState } from 'react-dom'
import { createInvoice, type InvoiceFormState } from '../actions'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function InvoiceForm({ customers }: { customers: { id: string; name: string }[] }) {
    const initialState: InvoiceFormState = {
        error: undefined,
        success: false,
    }

    const [state, formAction] = useFormState(createInvoice, initialState)
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
                    ✅ Invoice saved successfully
                </div>
            )}

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
                    placeholder="0"
                    defaultValue="0"
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
                    Back to List
                </Link>
            </div>
        </form>
    )
}
