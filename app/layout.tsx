import type { Metadata } from 'next'
import './globals.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

export const metadata: Metadata = {
  title: 'Nature Gallery',
  description: 'A curated collection of beautiful nature photography',
}

// Get your Google Client ID from: https://console.cloud.google.com/apis/credentials
// Create OAuth 2.0 Client ID -> Web Application
// Add your domain to Authorized JavaScript origins
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
