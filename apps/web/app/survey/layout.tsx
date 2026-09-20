import type { Metadata } from 'next'
import { getAbsoluteUrl, seoConfig } from '@/lib/seo'

// Layout is server-side by default. 
// We are hardcoding the static strings here or referencing the zh-CN default 
// because next-i18next in app router server components without proper locale routing 
// needs specific setup. For true dynamic SEO meta based on locale, we'd need generateMetadata.
// For now, keeping the structure standard.

export const metadata: Metadata = {
  title: '共创问卷与用户调研 | Co-creation Survey',
  description: '诚邀您花 3 分钟，聊聊那些关于写作的故事，加入 Narraverse 共创计划。',
  keywords: [
    'AI 写作问卷',
    '小说创作调研',
    '写作者用户反馈',
    'Narraverse 共创计划',
    'AI writing survey',
  ],
  alternates: {
    canonical: '/survey',
  },
  openGraph: {
    title: '共创问卷与用户调研 | Narraverse',
    description: '诚邀您花 3 分钟，聊聊那些关于写作的故事，加入 Narraverse 共创计划。',
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
    title: '共创问卷与用户调研 | Narraverse',
    description: '诚邀您花 3 分钟，聊聊那些关于写作的故事，加入 Narraverse 共创计划。',
    images: [seoConfig.defaultOgImage],
  },
}

const surveyWebPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': '共创问卷与用户调研 | Narraverse',
  'description': '诚邀您花 3 分钟，聊聊那些关于写作的故事，加入 Narraverse 共创计划。',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(surveyWebPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(surveyBreadcrumbJsonLd) }} />
      {children}
    </>
  )
}
