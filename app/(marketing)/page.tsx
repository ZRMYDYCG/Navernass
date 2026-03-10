import type { Metadata } from 'next'

import MarketingPageContent from './_components/marketing-page-content'

export const metadata: Metadata = {
  title: 'Narraverse - AI 小说创作平台',
  description: '基于 AI 的智能小说创作助手',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Narraverse - AI 小说创作平台',
    description: '基于 AI 的智能小说创作助手',
    type: 'website',
    url: '/',
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

export default function MarketingPage() {
  return <MarketingPageContent />
}
