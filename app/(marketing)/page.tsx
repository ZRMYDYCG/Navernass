'use client'

import { Suspense } from 'react'
import MarketingPageContent from './_components/marketing-page-content'

export default function MarketingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MarketingPageContent />
    </Suspense>
  )
}
