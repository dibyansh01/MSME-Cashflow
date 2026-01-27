'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createFollowUp(formData: FormData) {
  const invoiceId = formData.get('invoiceId') as string
  const method = formData.get('method') as string
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string
  const nextFollowUpOnStr = formData.get('nextFollowUpOn') as string

  await prisma.followUp.create({
    data: {
      invoiceId,
      method,
      status,
      notes,
      nextFollowUpOn: nextFollowUpOnStr
        ? new Date(nextFollowUpOnStr)
        : null,
    },
  })

  revalidatePath(`/invoices/${invoiceId}`)
  redirect(`/invoices/${invoiceId}`)
}
