import type { Metadata } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import type { PropsWithChildren } from "react"

import { routing } from "@/i18n/routing"
import { AppProvider } from "@/providers/app-provider"

import "../globals.css"

export const metadata: Metadata = {
  title: "Next Start",
  description: "现代化 Next.js 应用初始化模板",
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type LocaleLayoutProps = PropsWithChildren<{
  params: Promise<{ locale: string }>
}>

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppProvider>{children}</AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
