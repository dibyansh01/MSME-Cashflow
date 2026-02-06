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

// --- Data Constants ---

const COMPANY_NAMES = [
    "Acme Corp", "Globex Corporation", "Soylent Corp", "Initech",
    "Umbrella Corp", "Stark Industries", "Wayne Enterprises",
    "Cyberdyne Systems", "Massive Dynamic", "Hooli",
    "Vehement Capital", "Prestige Worldwide", "Dunder Mifflin",
    "Aperture Science", "Black Mesa"
];

const VENDOR_NAMES = [
    "Office Depot", "Tech Supplies Inc", "City Properties (Rent)",
    "Power Grid Co", "Fast Logistics", "Raw Materials Ltd",
    "ABC Consultants", "Global Internet Services", "Clean & Shine Services"
];

const EXPENSE_CATEGORIES = [
    'Raw Materials / Purchases',
    'Supplier Payments',
    'Salaries & Wages',
    'Rent / Lease',
    'Utilities',
    'Transport & Logistics',
    'Packaging & Consumables',
    'Loan EMI / Interest',
    'Taxes & Statutory',
    'Maintenance & Repairs',
    'Marketing & Advertising',
    'Professional Fees',
    'Office Expenses',
    'Miscellaneous',
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

    // 1. Cleanup existing data (Order matters for foreign keys)
    console.log('Cleaning up old data...');
    await prisma.followUp.deleteMany({});
    await prisma.paymentEntry.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.customer.deleteMany({});

    // Cash Out Cleanup
    await prisma.supplierPayment.deleteMany({});
    await prisma.supplierInvoice.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.expenseCategory.deleteMany({});
    await prisma.vendor.deleteMany({});

    console.log('Cleared existing data.');

    // --- CASH IN SEEDING (Existing Logic) ---

    const customers = [];

    // 2. Create Customers
    for (let i = 0; i < 20; i++) {
        const isCompany = Math.random() > 0.3;
        const name = isCompany ? getRandomElement(COMPANY_NAMES) + ` ${i}` : getRandomElement(NAMES) + ` ${i}`;

        customers.push(await prisma.customer.create({
            data: {
                name: name,
                email: `contact${i}@${name.replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '').toLowerCase()}.com`,
                phone: `98765${getRandomInt(10000, 99999)}`,
                location: getRandomElement(CITIES),
                creditTerms: getRandomElement([15, 30, 45, 60]),
            }
        }));
    }
    console.log(`Created ${customers.length} customers.`);

    // 3. Create Invoices
    let invoiceCount = 0;
    for (const customer of customers) {
        const numInvoices = getRandomInt(3, 8);
        for (let j = 0; j < numInvoices; j++) {
            const invoiceDate = addDays(new Date(), -getRandomInt(0, 90));
            const dueDate = addDays(invoiceDate, customer.creditTerms || 30);
            const today = new Date();
            const isOverdue = dueDate < today;
            const amount = getRandomInt(1000, 50000);

            let status = 'UNPAID';
            let paidAmount = 0;
            const scenario = Math.random();

            if (scenario < 0.3) { status = 'PAID'; paidAmount = amount; }
            else if (scenario < 0.6) { status = isOverdue ? 'OVERDUE' : 'UNPAID'; paidAmount = 0; }
            else if (scenario < 0.7) { status = 'PARTIAL'; paidAmount = getRandomInt(100, amount - 100); }
            else { status = isOverdue ? 'OVERDUE' : 'UNPAID'; }

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

            if (paidAmount > 0) {
                await prisma.paymentEntry.create({
                    data: {
                        invoiceId: invoice.id,
                        amount: paidAmount,
                        paymentDate: addDays(invoiceDate, getRandomInt(1, 10)),
                        method: getRandomElement(['UPI', 'BANK', 'CASH', 'CHEQUE']),
                        reference: `REF-${getRandomInt(10000, 99999)}`,
                        notes: "Seed payment"
                    }
                });
            }

            if (status === 'OVERDUE' || status === 'PARTIAL') {
                await prisma.followUp.create({
                    data: {
                        invoiceId: invoice.id,
                        followUpDate: addDays(today, getRandomInt(1, 5)),
                        method: 'CALL',
                        status: 'SCHEDULED',
                        notes: "Scheduled follow up call.",
                    }
                });
            }
        }
    }
    console.log(`Created ${invoiceCount} customer invoices.`);


    // --- CASH OUT SEEDING (New Logic) ---

    // 4. Create Vendors
    const vendors = [];
    for (const vName of VENDOR_NAMES) {
        vendors.push(await prisma.vendor.create({
            data: {
                name: vName,
                email: `info@${vName.split(' ')[0].toLowerCase()}.com`,
                phone: `99887${getRandomInt(10000, 99999)}`,
                creditTerms: getRandomElement([15, 30, 45]),
                notes: "Prime vendor"
            }
        }));
    }
    console.log(`Created ${vendors.length} vendors.`);

    // 5. Create Expense Categories
    const categories = [];
    for (const catName of EXPENSE_CATEGORIES) {
        categories.push(await prisma.expenseCategory.create({
            data: { name: catName }
        }));
    }
    console.log(`Created ${categories.length} expense categories.`);

    // 6. Create Expenses (Immediate Cash Out)
    let expenseCount = 0;
    for (let i = 0; i < 30; i++) {
        const cat = getRandomElement(categories);
        const relatedVendor = Math.random() > 0.5 ? getRandomElement(vendors) : null;
        const amount = getRandomInt(500, 15000);

        await prisma.expense.create({
            data: {
                categoryId: cat.id,
                vendorId: relatedVendor?.id,
                expenseDate: addDays(new Date(), -getRandomInt(0, 60)),
                amount: amount,
                paymentMode: getRandomElement(['CASH', 'UPI', 'BANK']),
                notes: `Payment for ${cat.name}`
            }
        });
        expenseCount++;
    }
    console.log(`Created ${expenseCount} expenses.`);

    // 7. Create Supplier Invoices (Payables)
    let supplierInvoiceCount = 0;
    for (const vendor of vendors) {
        const numInvoices = getRandomInt(2, 6);

        for (let k = 0; k < numInvoices; k++) {
            const invoiceDate = addDays(new Date(), -getRandomInt(0, 90));
            const dueDate = addDays(invoiceDate, vendor.creditTerms || 30);
            const today = new Date();
            const isOverdue = dueDate < today;
            const amount = getRandomInt(2000, 70000);

            // Scenario: 40% Paid, 30% Unpaid, 30% Overdue
            let status = 'UNPAID';
            let paidAmount = 0;
            const scenario = Math.random();

            if (scenario < 0.4) {
                status = 'PAID';
                paidAmount = amount;
            } else if (scenario < 0.7) {
                status = isOverdue ? 'OVERDUE' : 'UNPAID';
                paidAmount = 0;
            } else {
                // Partial
                status = 'PARTIAL';
                paidAmount = getRandomInt(500, amount - 100);
            }

            if (paidAmount >= amount) status = 'PAID';
            else if (paidAmount > 0) status = 'PARTIAL';
            else if (isOverdue) status = 'OVERDUE';

            const supInv = await prisma.supplierInvoice.create({
                data: {
                    vendorId: vendor.id,
                    invoiceNo: `SUP-${vendor.name.substring(0, 3).toUpperCase()}-${getRandomInt(1000, 9999)}`,
                    invoiceDate: invoiceDate,
                    dueDate: dueDate,
                    invoiceAmount: amount,
                    paidAmount: paidAmount,
                    outstandingAmount: amount - paidAmount,
                    status: status
                }
            });
            supplierInvoiceCount++;

            if (paidAmount > 0) {
                await prisma.supplierPayment.create({
                    data: {
                        supplierInvoiceId: supInv.id,
                        amount: paidAmount,
                        paymentDate: addDays(invoiceDate, getRandomInt(1, 5)),
                        method: getRandomElement(['BANK', 'UPI']),
                        reference: `TXN-${getRandomInt(100000, 999999)}`,
                        notes: "Payment to vendor"
                    }
                });
            }
        }
    }
    console.log(`Created ${supplierInvoiceCount} supplier invoices.`);

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
