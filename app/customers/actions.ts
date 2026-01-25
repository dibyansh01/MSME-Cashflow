'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export async function createCustomer(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const creditTerms = formData.get('creditTerms') as string

  if (!name) {
    throw new Error('Customer name is required')
  }

  await prisma.customer.create({
    data: {
      name,
      phone: phone || null,
      email: email || null,
      creditTerms: creditTerms ? Number(creditTerms) : null,
    },
  })

  revalidatePath('/customers')
}
