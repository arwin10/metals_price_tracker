import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Precious Metals Prices - thegoldprice.in',
  description: 'Track real-time and historical prices of all precious metals including gold, silver, platinum, palladium, rhodium, and more.',
}

export default function PricesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}