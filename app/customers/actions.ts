'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Server action to create a new customer.
 * Validates input data and creates a new customer record in the database.
 * @param {FormData} formData - Form data containing customer details
 */
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
