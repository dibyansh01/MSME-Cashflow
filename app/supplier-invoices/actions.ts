'use server';

import { prisma } from '@/lib/db/prisma';
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