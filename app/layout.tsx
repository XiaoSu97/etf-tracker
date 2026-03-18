import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ETF Tracker - 指数估值跟踪',
  description: '实时跟踪 A 股/港股/美股指数估值，PE 百分位分析，帮你把握投资机会',
  keywords: 'ETF, 指数，估值，PE, PB, 投资，A 股，港股，美股',
  authors: [{ name: 'XiaoSu97' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
