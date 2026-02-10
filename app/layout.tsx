import './globals.css'
import { Providers } from './providers'
import { AppLayout } from '@/components/AppLayout'

/**
 * Root Layout for the application.
 * Wraps the entire application with necessary providers and global styles.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 */
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
