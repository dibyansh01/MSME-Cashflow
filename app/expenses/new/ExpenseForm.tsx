'use client'

import { useFormState } from 'react-dom'
import { createExpense, type ExpenseFormState } from '../actions'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

type Props = {
    categories: { id: string; name: string }[]
    vendors: { id: string; name: string }[]
}

export default function ExpenseForm({ categories, vendors }: Props) {
    const initialState: ExpenseFormState = {
        error: undefined,
        success: false,
    }

    const [state, formAction] = useFormState(createExpense, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset()
        }
    }, [state.success])

    // Default date to today
    const today = new Date().toISOString().split('T')[0]

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            {state.error && (
                <div className="bg-yellow-50 border border-yellow-300 p-2 text-sm text-yellow-800 rounded">
                    ⚠ {state.error}
                </div>
            )}

            {state.success && (
                <div className="bg-green-50 border border-green-300 p-2 text-sm text-green-800 rounded">
                    ✅ Expense saved successfully
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">
                    Date *
                </label>
                <input
                    name="expenseDate"
                    type="date"
                    defaultValue={today}
                    required
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Category *
                </label>
                <select
                    name="categoryId"
                    required
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Vendor (Optional)
                </label>
                <select
                    name="vendorId"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                    <option value="">No Vendor</option>
                    {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Amount *
                </label>
                <input
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Payment Mode *
                </label>
                <select
                    name="paymentMode"
                    defaultValue="CASH"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Notes
                </label>
                <textarea
                    name="notes"
                    rows={3}
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Expense details..."
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                    Save Expense
                </button>

                <Link
                    href="/expenses"
                    className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors text-center"
                >
                    Back to List
                </Link>
            </div>
        </form>
    )
}
