import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl text-primary">
            MSME Cashflow
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Dashboard
            </Link>

            <Link href="/customers" className="hover:text-primary transition-colors">
              Customers
            </Link>

            <Link href="/invoices" className="hover:text-primary transition-colors">
              Invoices
            </Link>

            <Link href="/followups" className="hover:text-primary transition-colors">
              Collections Queue
            </Link>

            <Link href="/expenses" className="hover:text-primary transition-colors">
              Expenses
            </Link>

            <Link href="/vendors" className="hover:text-primary transition-colors">
              Vendors
            </Link>

            <Link
              href="/supplier-invoices"
              className="hover:text-primary transition-colors"
            >
              Supplier Invoices
            </Link>

            <Link
              href="/payables-queue"
              className="hover:text-primary transition-colors"
            >
              Payables Queue
            </Link>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4 text-sm font-medium">
          Account
        </div>
      </div>
    </nav>
  )
}