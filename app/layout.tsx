import './globals.css'
import { Providers } from './providers'
import { AppLayout } from '@/components/AppLayout'

/**
 * Root Layout for the application.
 * Wraps the entire application with necessary providers and global styles.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MSME CashFlow',
  description: 'Cashflow management for MSMEs',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  )
}
