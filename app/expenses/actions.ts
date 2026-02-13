'use server';

import {prisma} from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

export async function createExpense(formData: FormData) {
  await prisma.expense.create({
    data: {
      expenseDate: new Date(formData.get('expenseDate') as string),
      categoryId: formData.get('categoryId') as string,
      vendorId: (formData.get('vendorId') as string) || null,
      amount: Number(formData.get('amount')),
      paymentMode: formData.get('paymentMode') as string,
      notes: formData.get('notes') as string,
    },
  });

  revalidatePath('/expenses');
}