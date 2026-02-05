import { createVendor } from '../actions';

export default function NewVendorPage() {
  return (
    <form action={createVendor} className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Add Vendor</h1>

      <input name="name" placeholder="Vendor Name" required />
      <input name="phone" placeholder="Phone" />
      <input name="email" placeholder="Email" />
      <input name="creditTerms" type="number" placeholder="Credit Terms (days)" />
      <textarea name="notes" placeholder="Notes" />

      <button className="btn-primary">Save Vendor</button>
    </form>
  );
}