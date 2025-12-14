import type { Metadata } from 'next'
import { Caveat, Inter, Noto_Serif_SC } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Toaster as RadixToaster } from '@/components/ui/toaster'
import { FaviconProvider } from '@/providers/favicon-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
})

export const metadata: Metadata = {
  title: 'Narraverse - AI 小说创作平台',
  description: '基于 AI 的智能小说创作助手',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Narraverse',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="h-full">
      <head>
        <link
          rel="icon"
          href="/assets/svg/logo-dark.svg"
          type="image/svg+xml"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.variable} ${notoSerifSC.variable} ${caveat.variable} antialiased h-full font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <FaviconProvider />
          {children}
          <Toaster position="top-right" richColors />
          <RadixToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
