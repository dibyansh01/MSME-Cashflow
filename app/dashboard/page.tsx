import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { authOptions } from '@/lib/auth-options'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Welcome {session.user?.email}
      </h1>

      <p className="mt-2">Dashboard loaded successfully.</p>
      <div className="mt-6 flex gap-4">
  <Link href="/customers" className="underline">
    Customers
  </Link>
</div>

    </div>
  )
}
