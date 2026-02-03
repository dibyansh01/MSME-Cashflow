import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// --- Helpers ---

const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomElement = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// --- Data Arrays ---

const COMPANY_NAMES = [
    "Acme Corp", "Globex Corporation", "Soylent Corp", "Initech",
    "Umbrella Corp", "Stark Industries", "Wayne Enterprises",
    "Cyberdyne Systems", "Massive Dynamic", "Hooli",
    "Vehement Capital", "Prestige Worldwide", "Dunder Mifflin",
    "Aperture Science", "Black Mesa"
];

const NAMES = [
    "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown",
    "Charlie Davis", "Diana Evans", "Ethan Ford", "Fiona Green",
    "George Harris", "Hannah Ian", "Ian Jenkins", "Karen Kelly"
];

const CITIES = [
    "New York", "London", "Mumbai", "Delhi", "Bangalore",
    "Singapore", "Dubai", "Toronto", "Sydney", "Berlin",
    "San Francisco", "Tokyo", "Paris", "Chicago", "Boston"
];

// --- Main Seeding Logic ---

async function main() {
    console.log('Start seeding ...');

    // 1. Cleanup existing data
    await prisma.followUp.deleteMany({});
    await prisma.paymentEntry.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.customer.deleteMany({});

    console.log('Cleared existing data.');

    const customers = [];

    // 2. Create Customers
    for (let i = 0; i < 20; i++) {
        const isCompany = Math.random() > 0.3;
        const name = isCompany ? getRandomElement(COMPANY_NAMES) + ` ${i}` : getRandomElement(NAMES) + ` ${i}`;

        customers.push(await prisma.customer.create({
            data: {
                name: name,
                email: `contact${i}@${name.replace(/\s+/g, '').toLowerCase()}.com`,
                phone: `98765${getRandomInt(10000, 99999)}`,
                location: getRandomElement(CITIES),
                creditTerms: getRandomElement([15, 30, 45, 60]),
            }
        }));
    }
    console.log(`Created ${customers.length} customers.`);

    // 3. Create Invoices & Related Data
    let invoiceCount = 0;

    for (const customer of customers) {
        // Generate 3-8 invoices per customer
        const numInvoices = getRandomInt(3, 8);

        for (let j = 0; j < numInvoices; j++) {
            const invoiceDate = addDays(new Date(), -getRandomInt(0, 90)); // Past 90 days
            const dueDate = addDays(invoiceDate, customer.creditTerms || 30);
            const today = new Date();

            const isOverdue = dueDate < today;
            const amount = getRandomInt(1000, 50000);

            // Determine Scenario based on random chance
            // 30% Paid, 30% Unpaid (Safe), 10% Partial, 30% Overdue/Late
            let status = 'UNPAID';
            let paidAmount = 0;
            let scenario = Math.random();

            if (scenario < 0.3) {
                // PAID
                status = 'PAID';
                paidAmount = amount;
            } else if (scenario < 0.6) {
                // UNPAID (could be active or overdue if date passed)
                status = isOverdue ? 'OVERDUE' : 'UNPAID';
                paidAmount = 0;
            } else if (scenario < 0.7) {
                // PARTIAL
                status = 'PARTIAL';
                paidAmount = getRandomInt(100, amount - 100);
            } else {
                // FORCE OVERDUE (Adjust dates if needed to ensure it's overdue)
                if (!isOverdue) {
                    // If we want an overdue scenario but dates aren't there, skip forcing or treat as unpaid
                    status = 'UNPAID';
                } else {
                    status = 'OVERDUE';
                }
            }

            // Recalculate status based on amounts if Partial/Paid
            if (paidAmount >= amount) status = 'PAID';
            else if (paidAmount > 0) status = 'PARTIAL';
            else if (isOverdue) status = 'OVERDUE';

            const invoice = await prisma.invoice.create({
                data: {
                    customerId: customer.id,
                    invoiceNo: `INV-${new Date().getFullYear()}-${getRandomInt(1000, 9999)}-${invoiceCount}`,
                    invoiceDate: invoiceDate,
                    dueDate: dueDate,
                    invoiceAmount: amount,
                    paidAmount: paidAmount,
                    outstandingAmount: amount - paidAmount,
                    status: status,
                }
            });
            invoiceCount++;

            // 4. Create Payments
            if (paidAmount > 0) {
                // If fully paid, maybe 1 or 2 payments
                const paymentDate = addDays(invoiceDate, getRandomInt(1, 10));
                await prisma.paymentEntry.create({
                    data: {
                        invoiceId: invoice.id,
                        amount: paidAmount,
                        paymentDate: paymentDate,
                        method: getRandomElement(['UPI', 'BANK', 'CASH', 'CHEQUE']),
                        reference: `REF-${getRandomInt(10000, 99999)}`,
                        notes: "Seed payment"
                    }
                });
            }

            // 5. Create FollowUps for Overdue or Partial
            if (status === 'OVERDUE' || status === 'PARTIAL') {
                const numFollowUps = getRandomInt(1, 4);
                let previousFollowUpDate = addDays(dueDate, 2); // Start 2 days after due date

                for (let k = 0; k < numFollowUps; k++) {
                    const currentFollowUpDate = previousFollowUpDate;

                    // Determine next follow up date (either another historical one, or the upcoming scheduled one)
                    // If this is the last loop iteration, next is future. Else next is some days later but still past/today.

                    const daysToNext = getRandomInt(3, 7);
                    const nextDate = addDays(currentFollowUpDate, daysToNext);

                    // Update previous for next iteration
                    previousFollowUpDate = nextDate;

                    if (currentFollowUpDate > today) break;

                    await prisma.followUp.create({
                        data: {
                            invoiceId: invoice.id,
                            followUpDate: currentFollowUpDate,
                            method: getRandomElement(['CALL', 'WHATSAPP', 'EMAIL']),
                            status: getRandomElement(['NO_RESPONSE', 'PROMISED', 'DISPUTED']),
                            notes: `Customer said they will pay soon. Attempt ${k + 1}`,
                            nextFollowUpOn: nextDate // Point to the next one
                        }
                    });
                }

                // Add one active Upcoming FollowUp
                // The 'previousFollowUpDate' from the loop is now our target future date (or close to it)
                // 20% chance it's a "Missed" follow-up (date is in the past, but status is SCHEDULED)
                let upcomingDate = previousFollowUpDate;
                const isMissed = Math.random() < 0.2;

                if (isMissed) {
                    // Set date to 1-5 days ago
                    upcomingDate = addDays(today, -getRandomInt(1, 5));
                } else if (upcomingDate <= today) {
                    // Ensure it's in future if not missed
                    upcomingDate = addDays(today, getRandomInt(1, 5));
                }

                await prisma.followUp.create({
                    data: {
                        invoiceId: invoice.id,
                        followUpDate: upcomingDate,
                        method: 'CALL',
                        status: 'SCHEDULED',
                        notes: isMissed ? "Missed scheduled call." : "Scheduled follow up call.",
                        nextFollowUpOn: null // No defined next follow up after this future one yet
                    }
                });
            }
        }
    }

    console.log(`Created ${invoiceCount} invoices.`);
    console.log('Seeding finished.');
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
