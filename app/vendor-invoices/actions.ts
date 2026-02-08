'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type VendorInvoiceFormState = {
  message?: string
  error?: string
}

export async function createVendorInvoice(prevState: VendorInvoiceFormState, formData: FormData): Promise<VendorInvoiceFormState> {
  const vendorId = formData.get('vendorId') as string
  const invoiceNo = formData.get('invoiceNo') as string
  const invoiceDateStr = formData.get('invoiceDate') as string
  const dueDateStr = formData.get('dueDate') as string
  const amountStr = formData.get('amount') as string
  const description = formData.get('description') as string

  if (!vendorId || !invoiceNo || !invoiceDateStr || !dueDateStr || !amountStr) {
    return { error: 'Please fill in all required fields' }
  }

  const invoiceAmount = parseFloat(amountStr)
  if (isNaN(invoiceAmount) || invoiceAmount <= 0) {
    return { error: 'Amount must be a positive number' }
  }

  const invoiceDate = new Date(invoiceDateStr)
  const dueDate = new Date(dueDateStr)

  try {
    await prisma.vendorInvoice.create({
      data: {
        vendorId,
        invoiceNo,
        invoiceDate,
        dueDate,
        invoiceAmount,
        paidAmount,
        outstandingAmount,
        status,
      },
    });

    revalidatePath('/vendor-invoices');
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Failed to create vendor invoice' }
  }
}