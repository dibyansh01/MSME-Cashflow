import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding ...')

    const customers = []
    for (let i = 1; i <= 25; i++) {
        customers.push({
            name: `Pagination Test User ${i}`,
            email: `user${i}@example.com`,
            phone: `98765432${i.toString().padStart(2, '0')}`,
            creditTerms: 30,
        })
    }

    // Email is not unique in Customer model, so we use createMany
    await prisma.customer.createMany({
        data: customers,
    })

    console.log(`Created ${customers.length} customers.`)
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
