import { prisma } from '@/lib/db/prisma'

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
  })
}
