'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CASH_IN_LINKS = [
  { href: '/customers', label: 'Customers' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/followups', label: 'Collections' },
]

const CASH_OUT_LINKS = [
  { href: '/expenses', label: 'Expenses' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/supplier-invoices', label: 'Suppliers' },
  { href: '/payables-queue', label: 'Payables' },
]

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname?.startsWith(path)) return true
    return false
  }

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-18 flex items-center justify-between py-2">
        {/* Logo & Dashboard */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl text-blue-600 tracking-tight">
            MSME Cashflow
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/')
              ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            Dashboard
          </Link>
        </div>

        {/* Groups */}
        <div className="hidden md:flex items-center gap-6">

          {/* Cash In Group */}
          <div className="flex flex-col items-start gap-1 p-1.5 rounded-xl bg-gray-50/50 border border-gray-100/50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">
              Cash In
            </span>
            <div className="flex items-center gap-1">
              {CASH_IN_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                    ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5 font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Cash Out Group */}
          <div className="flex flex-col items-start gap-1 p-1.5 rounded-xl bg-gray-50/50 border border-gray-100/50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">
              Cash Out
            </span>
            <div className="flex items-center gap-1">
              {CASH_OUT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                    ? 'bg-white text-red-700 shadow-sm ring-1 ring-black/5 font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-300">
            AC
          </div>
        </div>
      </div>
    </nav>
  )
}