import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Nunito, Noto_Sans } from 'next/font/google'
import { AshaProvider } from '@/lib/store'
import { PwaRegister } from '@/components/asha/pwa-register'
import './globals.css'

const heading = Nunito({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-heading',
})

const body = Noto_Sans({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Asha - Kinetic Age AI Companion',
  description:
    'Asha is your Kinetic Age AI companion for senior wellness and daily mobility. Daily check-ins, 2-minute seated routines, and WhatsApp reports for family and physio.',
  generator: 'v0.app',
  applicationName: 'Asha',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Asha',
  },
  icons: {
    icon: [{ url: '/asha-avatar.png', type: 'image/png' }],
    apple: '/asha-avatar.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2E7D32',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${heading.variable} ${body.variable}`}
    >
      <body suppressHydrationWarning className="antialiased">
        <AshaProvider>{children}</AshaProvider>

        <PwaRegister />

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
