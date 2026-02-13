import {prisma} from '@/lib/db/prisma';
import { addSupplierPayment } from '../actions';

export default async function SupplierInvoiceDetail({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await prisma.supplierInvoice.findUnique({
    where: { id: params.id },
    include: {
      vendor: true,
      payments: { orderBy: { paymentDate: 'desc' } },
    },
  });

  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">
        Supplier Invoice {invoice.invoiceNo}
      </h1>

      <div className="card">
        <p><b>Vendor:</b> {invoice.vendor.name}</p>
        <p><b>Invoice Amount:</b> ₹{invoice.invoiceAmount}</p>
        <p><b>Outstanding:</b> ₹{invoice.outstandingAmount}</p>
        <p><b>Status:</b> {invoice.status}</p>
      </div>

      {invoice.outstandingAmount > 0 && (
        <form
          action={addSupplierPayment.bind(null, invoice.id)}
          className="max-w-md space-y-3"
        >
          <h2 className="font-semibold">Add Payment</h2>

          <input type="date" name="paymentDate" required />
          <input name="amount" type="number" placeholder="Amount" required />

          <select name="method">
            <option value="BANK">Bank</option>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
          </select>

          <input name="reference" placeholder="Reference" />
          <textarea name="notes" placeholder="Notes" />

          <button className="btn-primary">Save Payment</button>
        </form>
      )}

      <div>
        <h2 className="font-semibold mb-2">Payment History</h2>
        <ul className="space-y-1">
          {invoice.payments.map(p => (
            <li key={p.id}>
              {p.paymentDate.toDateString()} – ₹{p.amount} ({p.method})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}