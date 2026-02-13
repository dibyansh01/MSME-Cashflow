import {prisma} from '@/lib/db/prisma';
import Link from 'next/link';

function getPriority(dueDate: Date) {
  const today = new Date();
  const diffDays =
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 'OVERDUE';
  if (diffDays <= 7) return 'DUE SOON';
  return 'NORMAL';
}

export default async function PayablesQueuePage() {
  const invoices = await prisma.supplierInvoice.findMany({
    where: {
      status: { in: ['UNPAID', 'PARTIAL'] },
      outstandingAmount: { gt: 0 },
    },
    include: {
      vendor: true,
    },
    orderBy: {
      dueDate: 'asc',
    },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Payables Queue</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Invoice</th>
            <th>Due Date</th>
            <th>Outstanding</th>
            <th>Priority</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map(inv => {
            const priority = getPriority(inv.dueDate);

            return (
              <tr key={inv.id}>
                <td>{inv.vendor.name}</td>

                <td>
                  <Link
                    href={`/supplier-invoices/${inv.id}`}
                    className="text-blue-600"
                  >
                    {inv.invoiceNo}
                  </Link>
                </td>

                <td className={priority === 'OVERDUE' ? 'text-red-600' : ''}>
                  {inv.dueDate.toDateString()}
                </td>

                <td className="font-semibold">
                  ₹{inv.outstandingAmount}
                </td>

                <td>
                  {priority === 'OVERDUE' && (
                    <span className="badge badge-danger">OVERDUE</span>
                  )}
                  {priority === 'DUE SOON' && (
                    <span className="badge badge-warning">DUE SOON</span>
                  )}
                  {priority === 'NORMAL' && (
                    <span className="badge badge-neutral">NORMAL</span>
                  )}
                </td>

                <td>
                  <Link
                    href={`/supplier-invoices/${inv.id}`}
                    className="text-blue-600"
                  >
                    Pay / View
                  </Link>
                </td>
              </tr>
            );
          })}

          {invoices.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4">
                🎉 No pending payables
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}