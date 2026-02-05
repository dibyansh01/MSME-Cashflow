'use server';

import {prisma} from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

export async function createVendor(formData: FormData) {
  await prisma.vendor.create({
    data: {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      creditTerms: Number(formData.get('creditTerms')),
      notes: formData.get('notes') as string,
    },
  });

  revalidatePath('/vendors');
}