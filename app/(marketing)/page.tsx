import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import enUS from '@/i18n/dicts/en-US'
import zhCN from '@/i18n/dicts/zh-CN'
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE_KEY,
  type Locale,
} from '@/i18n/config'
import { getAbsoluteUrl, seoConfig } from '@/lib/seo'
import MarketingPageContent from './_components/marketing-page-content'

const dictionaries = {
  'zh-CN': zhCN,
  'en-US': enUS,
} as const

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
  const marketingSeo = dictionaries[locale].marketing.seo

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
      locale: locale === 'zh-CN' ? 'zh_CN' : 'en_US',
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
