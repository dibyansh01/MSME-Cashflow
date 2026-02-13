'use server';

import {prisma} from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

/**
 * CREATE SUPPLIER INVOICE (CREDIT)
 */
export async function createSupplierInvoice(formData: FormData) {
  const invoiceAmount = Number(formData.get('invoiceAmount'));

  await prisma.supplierInvoice.create({
    data: {
      vendorId: formData.get('vendorId') as string,
      invoiceNo: formData.get('invoiceNo') as string,
      invoiceDate: new Date(formData.get('invoiceDate') as string),
      dueDate: new Date(formData.get('dueDate') as string),
      invoiceAmount,
      paidAmount: 0,
      outstandingAmount: invoiceAmount,
      status: 'UNPAID',
    },
  });

  revalidatePath('/supplier-invoices');
}

/**
 * ADD PAYMENT AGAINST SUPPLIER INVOICE
 */
export async function addSupplierPayment(
  supplierInvoiceId: string,
  formData: FormData
) {
  const amount = Number(formData.get('amount'));

  const invoice = await prisma.supplierInvoice.findUnique({
    where: { id: supplierInvoiceId },
  });

  if (!invoice) throw new Error('Supplier invoice not found');

  const newPaidAmount = invoice.paidAmount + amount;
  const newOutstanding = invoice.invoiceAmount - newPaidAmount;

  await prisma.$transaction([
    prisma.supplierPayment.create({
      data: {
        supplierInvoiceId,
        amount,
        paymentDate: new Date(formData.get('paymentDate') as string),
        method: formData.get('method') as string,
        reference: formData.get('reference') as string,
        notes: formData.get('notes') as string,
      },
    }),
    prisma.supplierInvoice.update({
      where: { id: supplierInvoiceId },
      data: {
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstanding,
        status: newOutstanding === 0 ? 'PAID' : 'PARTIAL',
      },
    }),
  ]);

  revalidatePath(`/supplier-invoices/${supplierInvoiceId}`);
}