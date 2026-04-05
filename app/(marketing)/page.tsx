import type { Metadata } from 'next'
import type { Locale } from '@/i18n/config'
import { cookies } from 'next/headers'
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_KEY,
  LOCALE_DICTIONARY_MAP,
  LOCALE_OPEN_GRAPH_MAP,
  LOCALES,
} from '@/i18n/config'
import deDE from '@/i18n/dicts/de-DE'
import enGB from '@/i18n/dicts/en-GB'
import enUS from '@/i18n/dicts/en-US'
import frFR from '@/i18n/dicts/fr-FR'
import jaJP from '@/i18n/dicts/ja-JP'
import koKR from '@/i18n/dicts/ko-KR'
import zhCN from '@/i18n/dicts/zh-CN'
import zhTW from '@/i18n/dicts/zh-TW'
import { getAbsoluteUrl, seoConfig } from '@/lib/seo'
import MarketingPageContent from './_components/marketing-page-content'

type DeepWiden<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly DeepWiden<U>[]
    : T extends object
      ? { [K in keyof T]: DeepWiden<T[K]> }
      : T

const dictionaries = {
  'de-DE': deDE,
  'en-GB': enGB,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'fr-FR': frFR,
  'ja-JP': jaJP,
  'ko-KR': koKR,
} as const satisfies Record<Locale, DeepWiden<typeof zhCN>>

function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}

async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const localeFromCookie = cookieStore.get(LOCALE_COOKIE_KEY)?.value
  return localeFromCookie && isValidLocale(localeFromCookie) ? localeFromCookie : DEFAULT_LOCALE
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale()
  const marketingSeo = dictionaries[LOCALE_DICTIONARY_MAP[locale]].marketing.seo

  return {
    title: marketingSeo.title,
    description: marketingSeo.description,
    keywords: [...marketingSeo.keywords],
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: marketingSeo.title,
      description: marketingSeo.description,
      type: 'website',
      url: '/',
      locale: LOCALE_OPEN_GRAPH_MAP[locale],
      images: [
        {
          url: seoConfig.defaultOgImage,
          width: 1200,
          height: 630,
          alt: marketingSeo.ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: marketingSeo.title,
      description: marketingSeo.description,
      images: [seoConfig.defaultOgImage],
    },
  }
}

export default async function MarketingPage() {
  const locale = await getCurrentLocale()
  const marketingSeo = dictionaries[locale].marketing.seo

  const marketingWebPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': marketingSeo.title,
    'description': marketingSeo.description,
    'url': getAbsoluteUrl('/'),
    'inLanguage': locale,
    'isPartOf': {
      '@type': 'WebSite',
      'name': seoConfig.siteName,
      'url': getAbsoluteUrl('/'),
    },
    'about': marketingSeo.about.map(name => ({ '@type': 'Thing', name })),
  }

  const marketingOrganizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': seoConfig.siteName,
    'url': getAbsoluteUrl('/'),
    'logo': getAbsoluteUrl('/assets/svg/logo-dark.svg'),
    'description': marketingSeo.description,
  }

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(marketingWebPageJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(marketingOrganizationJsonLd)}
      </script>
      <MarketingPageContent />
    </>
  )
}
