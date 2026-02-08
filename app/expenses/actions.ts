'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export type ExpenseFormState = {
  error?: string
  success?: boolean
}

export async function createExpense(
  prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const expenseDateStr = formData.get('expenseDate') as string
  const categoryId = formData.get('categoryId') as string
  const vendorIdRaw = formData.get('vendorId') as string
  const amountRaw = formData.get('amount')
  const paymentMode = formData.get('paymentMode') as string
  const notes = formData.get('notes') as string

  if (!expenseDateStr || !categoryId || !amountRaw || !paymentMode) {
    return { error: 'Please fill in all required fields' }
  }

  try {
    const expenseDate = new Date(expenseDateStr)
    const vendorId = vendorIdRaw || null
    const amount = Number(amountRaw)

    await prisma.expense.create({
      data: {
        expenseDate,
        categoryId,
        vendorId,
        amount,
        paymentMode,
        notes: notes || null,
      },
    })

    revalidatePath('/expenses')
    return { success: true }
  } catch (error) {
    console.error('Create Expense Error:', error)
    return { error: 'Failed to create expense. Please try again.' }
  }
}