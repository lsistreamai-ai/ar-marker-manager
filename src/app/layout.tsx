import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AR Marker Manager',
  description: 'Create barcode markers for AR.js and assign GLB models',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
