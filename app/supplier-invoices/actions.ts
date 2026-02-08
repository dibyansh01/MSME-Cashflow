'use server';

import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

export type SupplierInvoiceFormState = {
  error?: string
  success?: boolean
}

/**
 * CREATE SUPPLIER INVOICE (CREDIT)
 */
export async function createSupplierInvoice(prevState: SupplierInvoiceFormState, formData: FormData): Promise<SupplierInvoiceFormState> {
  const vendorId = formData.get('vendorId') as string
  const invoiceNo = formData.get('invoiceNo') as string
  const invoiceDateStr = formData.get('invoiceDate') as string
  const invoiceAmountStr = formData.get('invoiceAmount') as string
  const paidAmountStr = formData.get('paidAmount') as string

  if (!vendorId || !invoiceNo || !invoiceDateStr || !invoiceAmountStr || !paidAmountStr) {
    return { error: 'Missing required fields' }
  }

  const invoiceAmount = Number(invoiceAmountStr)
  const paidAmount = Number(paidAmountStr)

  if (paidAmount > invoiceAmount) {
    return { error: 'Paid amount cannot be greater than invoice amount' }
  }

  const outstandingAmount = invoiceAmount - paidAmount
  const invoiceDate = new Date(invoiceDateStr)

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { creditTerms: true },
    })

    if (!vendor) {
      return { error: 'Vendor not found' }
    }

    const creditDays = vendor.creditTerms ?? 0
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + creditDays)

    let status: 'UNPAID' | 'PARTIAL' | 'PAID' = 'UNPAID'
    if (outstandingAmount === 0) status = 'PAID'
    else if (paidAmount > 0) status = 'PARTIAL'

    await prisma.supplierInvoice.create({
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

    revalidatePath('/supplier-invoices');
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Failed to create supplier invoice' }
  }
}

/**
 * ADD PAYMENT AGAINST SUPPLIER INVOICE
 */