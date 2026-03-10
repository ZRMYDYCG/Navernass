import type { Metadata } from 'next'
import { getAbsoluteUrl, seoConfig } from '@/lib/seo'
import MarketingPageContent from './_components/marketing-page-content'

export const metadata: Metadata = {
  title: 'AI 小说创作平台与网文写作助手',
  description: seoConfig.marketingDescription,
  keywords: [
    'AI 小说创作平台',
    'AI 写作助手',
    '网文创作工具',
    '小说续写',
    '人物设定管理',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: seoConfig.marketingTitle,
    description: seoConfig.marketingDescription,
    type: 'website',
    url: '/',
    images: [
      {
        url: seoConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${seoConfig.siteName} 首页展示图`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.marketingTitle,
    description: seoConfig.marketingDescription,
    images: [seoConfig.defaultOgImage],
  },
}

const marketingWebPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': seoConfig.marketingTitle,
  'description': seoConfig.marketingDescription,
  'url': getAbsoluteUrl('/'),
  'inLanguage': 'zh-CN',
  'isPartOf': {
    '@type': 'WebSite',
    'name': seoConfig.siteName,
    'url': getAbsoluteUrl('/'),
  },
  'about': [
    { '@type': 'Thing', 'name': 'AI 小说创作' },
    { '@type': 'Thing', 'name': '网文写作' },
    { '@type': 'Thing', 'name': '创作效率工具' },
  ],
}

const marketingOrganizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': seoConfig.siteName,
  'url': getAbsoluteUrl('/'),
  'logo': getAbsoluteUrl('/assets/svg/logo-dark.svg'),
  'description': seoConfig.marketingDescription,
}

export default function MarketingPage() {
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
