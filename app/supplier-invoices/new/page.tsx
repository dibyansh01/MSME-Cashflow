import { prisma } from '@/lib/db/prisma';
import SupplierInvoiceForm from './SupplierInvoiceForm';

export default async function NewSupplierInvoicePage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Add Supplier Invoice</h1>
      <SupplierInvoiceForm vendors={vendors} />
    </div>
  );
}