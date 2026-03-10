import type { Metadata } from 'next'
import { Caveat, Inter, Noto_Serif_SC } from 'next/font/google'
import { ColorThemeProvider } from '@/components/providers/color-theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { Toaster as RadixToaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/providers/auth-provider'
import { FaviconProvider } from '@/providers/favicon-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Narraverse - AI 小说创作平台',
  description: '基于 AI 的智能小说创作助手',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Narraverse',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Narraverse - AI 小说创作平台',
    description: '基于 AI 的智能小说创作助手',
    type: 'website',
    images: [
      {
        url: '/landing-page-1.png',
        width: 1200,
        height: 630,
        alt: 'Narraverse',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Narraverse - AI 小说创作平台',
    description: '基于 AI 的智能小说创作助手',
    images: ['/landing-page-1.png'],
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
          <ColorThemeProvider>
            <AuthProvider>
              <FaviconProvider />
              {children}
              <Toaster position="top-right" richColors />
              <RadixToaster />
            </AuthProvider>
          </ColorThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
