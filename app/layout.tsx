import { Analytics } from '@vercel/analytics/next'
import { Geist } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'ListShield — Marketplace compliance, without the anxiety',
  description: 'AI-powered listing audits for e-commerce sellers. Catch trademark conflicts and policy risks before they put your shop at risk.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#121923',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className={geist.variable}>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
