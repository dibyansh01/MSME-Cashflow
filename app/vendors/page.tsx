import {prisma} from '@/lib/db/prisma';
import Link from 'next/link';

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Vendors</h1>
        <Link href="/vendors/new" className="btn-primary">
          + New Vendor
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Credit Terms</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map(v => (
            <tr key={v.id}>
              <td>{v.name}</td>
              <td>{v.creditTerms ?? '-'} days</td>
              <td>{v.createdAt.toDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}