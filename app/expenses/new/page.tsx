import { createExpense } from '../actions';
import { getExpenseCategories } from '@/lib/services/expenseCategoryService';
import {prisma} from '@/lib/db/prisma';

export default async function NewExpensePage() {
  const categories = await getExpenseCategories();
  const vendors = await prisma.vendor.findMany();

  return (
    <form action={createExpense} className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Add Expense</h1>

      <input type="date" name="expenseDate" required />

      <select name="categoryId" required>
        <option value="">Select Category</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select name="vendorId">
        <option value="">No Vendor</option>
        {vendors.map(v => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </select>

      <input name="amount" type="number" placeholder="Amount" required />

      <select name="paymentMode">
        <option value="CASH">Cash</option>
        <option value="BANK">Bank</option>
        <option value="UPI">UPI</option>
      </select>

      <textarea name="notes" placeholder="Notes" />

      <button className="btn-primary">Save Expense</button>
    </form>
  );
}