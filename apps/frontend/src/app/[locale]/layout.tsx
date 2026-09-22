import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";

import { routing } from "@/i18n/routing";
import { AppProvider } from "@/providers/app-provider";

import "../globals.css";

export const metadata: Metadata = {
  title: "Narraverse - AI 小说创作平台",
  description:
    "Narraverse 是面向网文创作者的 AI 小说创作平台，支持灵感共创、人物设定管理、章节续写与发布。",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = PropsWithChildren<{
  params: Promise<{ locale: string }>;
}>;

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppProvider>{children}</AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
