import {prisma} from '@/lib/db/prisma';
import Link from 'next/link';

export default async function SupplierInvoicesPage() {
  const invoices = await prisma.supplierInvoice.findMany({
    include: { vendor: true },
    orderBy: { dueDate: 'asc' },
  });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Supplier Invoices</h1>
        <Link href="/supplier-invoices/new" className="btn-primary">
          + New Supplier Invoice
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Vendor</th>
            <th>Due Date</th>
            <th>Invoice Amount</th>
            <th>Outstanding</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td>
                <Link
                  href={`/supplier-invoices/${inv.id}`}
                  className="text-blue-600"
                >
                  {inv.invoiceNo}
                </Link>
              </td>
              <td>{inv.vendor.name}</td>
              <td>{inv.dueDate.toDateString()}</td>
              <td>₹{inv.invoiceAmount}</td>
              <td className="text-red-600">₹{inv.outstandingAmount}</td>
              <td>{inv.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}