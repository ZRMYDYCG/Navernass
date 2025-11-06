import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/providers/theme-provider'
import { FaviconProvider } from '@/providers/favicon-provider'
import './globals.css'
import Head from 'next/head'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Narraverse - AI 小说创作平台',
  description: '基于 AI 的智能小说创作助手',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="/assets/svg/logo-dark.svg"
          type="image/svg+xml"
        />
      </head>
      <body className={`${inter.variable} antialiased h-full`}>
        <ThemeProvider>
          <FaviconProvider />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
