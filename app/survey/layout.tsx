import type { Metadata } from 'next'
import { getAbsoluteUrl, seoConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: '共创问卷与用户调研',
  description: seoConfig.surveyDescription,
  keywords: [
    'AI 写作问卷',
    '小说创作调研',
    '写作者用户反馈',
    'Narraverse 共创计划',
  ],
  alternates: {
    canonical: '/survey',
  },
  openGraph: {
    title: seoConfig.surveyTitle,
    description: seoConfig.surveyDescription,
    type: 'website',
    url: '/survey',
    images: [
      {
        url: seoConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${seoConfig.siteName} 共创问卷`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.surveyTitle,
    description: seoConfig.surveyDescription,
    images: [seoConfig.defaultOgImage],
  },
}

const surveyWebPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': seoConfig.surveyTitle,
  'description': seoConfig.surveyDescription,
  'url': getAbsoluteUrl('/survey'),
  'inLanguage': 'zh-CN',
  'isPartOf': {
    '@type': 'WebSite',
    'name': seoConfig.siteName,
    'url': getAbsoluteUrl('/'),
  },
}

const surveyBreadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': '首页',
      'item': getAbsoluteUrl('/'),
    },
    {
      '@type': 'ListItem',
      'position': 2,
      'name': '共创问卷',
      'item': getAbsoluteUrl('/survey'),
    },
  ],
}

export default function SurveyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(surveyWebPageJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(surveyBreadcrumbJsonLd)}
      </script>
      {children}
    </>
  )
}
