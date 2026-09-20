"use client"

import { Suspense } from 'react'
import { PublishPageClient } from './_components/publish-page-client'

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
}

export default function PublishPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PublishPageClient />
    </Suspense>
  )
}
