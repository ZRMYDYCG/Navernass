'use client'

import { Suspense } from 'react'
import { MarketingSkeleton } from './_components/marketing-skeleton'
import dynamic from 'next/dynamic'

const MarketingPageContent = dynamic(
  () => import('./_components/marketing-page-content'),
  {
    ssr: true,
    loading: () => <MarketingSkeleton />,
  }
)

export default function MarketingPage() {
  return (
    <Suspense fallback={<MarketingSkeleton />}>
      <MarketingPageContent />
    </Suspense>
  )
}
