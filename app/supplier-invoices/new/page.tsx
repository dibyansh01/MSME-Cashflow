import {prisma} from '@/lib/db/prisma';
import { createSupplierInvoice } from '../actions';

export default async function NewSupplierInvoicePage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <form action={createSupplierInvoice} className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Add Supplier Invoice</h1>

      <select name="vendorId" required>
        <option value="">Select Vendor</option>
        {vendors.map(v => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      <input name="invoiceNo" placeholder="Invoice Number" required />

      <input type="date" name="invoiceDate" required />
      <input type="date" name="dueDate" required />

      <input
        name="invoiceAmount"
        type="number"
        placeholder="Invoice Amount"
        required
      />

      <button className="btn-primary">Save Supplier Invoice</button>
    </form>
  );
}