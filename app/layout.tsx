import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aesthetic Gallery',
  description: 'A curated collection of beautiful photography',
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
