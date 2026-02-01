'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export async function createInvoice(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const invoiceNo = formData.get('invoiceNo') as string
  const invoiceDateStr = formData.get('invoiceDate') as string
  const invoiceAmountStr = formData.get('invoiceAmount') as string
  const paidAmountStr = formData.get('paidAmount') as string

  if (!customerId || !invoiceNo || !invoiceDateStr || !invoiceAmountStr || !paidAmountStr) {
    throw new Error('Missing required fields')
  }

  const invoiceAmount = Number(invoiceAmountStr)
  const paidAmount = Number(paidAmountStr)

  if (paidAmount > invoiceAmount) {
    throw new Error('Paid amount cannot be greater than invoice amount')
  }

  const outstandingAmount = invoiceAmount - paidAmount
  const invoiceDate = new Date(invoiceDateStr)

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { creditTerms: true },
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const creditDays = customer.creditTerms ?? 0
  const dueDate = new Date(invoiceDate)
  dueDate.setDate(dueDate.getDate() + creditDays)

  let status: 'UNPAID' | 'PARTIAL' | 'PAID' = 'UNPAID'
  if (outstandingAmount === 0) status = 'PAID'
  else if (paidAmount > 0) status = 'PARTIAL'

  console.log({
    customerId,
    invoiceNo,
    invoiceDate,
    dueDate,
    invoiceAmount,
    paidAmount,
    outstandingAmount,
    status,
  })

  await prisma.invoice.create({
    data: {
      customerId,
      invoiceNo,
      invoiceDate,
      dueDate,
      invoiceAmount,
      paidAmount,
      outstandingAmount,
      status,
    },
  })

  revalidatePath('/invoices')
}
