import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Caveat, Inter, Lora, Noto_Serif_SC } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Toaster as RadixToaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/context/auth-provider'
import { ColorProvider } from '@/context/color-provider'
import { I18nProvider } from '@/context/i18n-provider'
import { ThemeProvider } from '@/context/theme-provider'
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE_KEY,
  type Locale,
} from '@/i18n/config'
import { getSiteUrl, seoConfig } from '@/lib/seo'
import './globals.css'

function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-serif-sc',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
  display: 'swap',
})

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  title: {
    default: seoConfig.defaultTitle,
    template: '%s | Narraverse',
  },
  description: seoConfig.defaultDescription,
  keywords: [
    'AI 小说创作',
    '网文写作工具',
    'AI 写作助手',
    '小说创作平台',
    'Narraverse',
  ],
  metadataBase: getSiteUrl(),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: seoConfig.siteName,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    siteName: seoConfig.siteName,
    locale: 'zh_CN',
    type: 'website',
    url: '/',
    images: [
      {
        url: seoConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${seoConfig.siteName} 品牌预览图`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [seoConfig.defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'index': true,
      'follow': true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const localeFromCookie = cookieStore.get(LOCALE_COOKIE_KEY)?.value
  const initialLocale =
    localeFromCookie && isValidLocale(localeFromCookie)
      ? localeFromCookie
      : DEFAULT_LOCALE

  return (
    <html lang={initialLocale} suppressHydrationWarning className="h-full">
      <head>
        <link
          rel="icon"
          href="/assets/svg/logo-dark.svg"
          type="image/svg+xml"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.variable} ${lora.variable} ${notoSerifSC.variable} ${caveat.variable} antialiased h-full font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <ColorProvider>
            <I18nProvider initialLocale={initialLocale}>
              <AuthProvider>
                {children}
                <Toaster position="top-right" richColors />
                <RadixToaster />
              </AuthProvider>
            </I18nProvider>
          </ColorProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
