import {prisma} from '@/lib/db/prisma';
import Link from 'next/link';

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    include: { category: true, vendor: true },
    orderBy: { expenseDate: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Expenses</h1>
        <Link href="/expenses/new" className="btn-primary">
          + New Expense
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Vendor</th>
            <th>Amount</th>
            <th>Mode</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(e => (
            <tr key={e.id}>
              <td>{e.expenseDate.toDateString()}</td>
              <td>{e.category.name}</td>
              <td>{e.vendor?.name ?? '-'}</td>
              <td>₹{e.amount}</td>
              <td>{e.paymentMode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}