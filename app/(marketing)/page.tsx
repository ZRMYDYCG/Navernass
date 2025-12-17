'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import CTA from './_components/cta'
import Features from './_components/features/features'
import Hero from './_components/hero'

export default function MarketingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const hasRedirectedRef = useRef(false)

  const redirectTo = searchParams.get('redirectTo')

  useEffect(() => {
    if (!loading && user && redirectTo && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true
      router.push(redirectTo)
    }
  }, [user, loading, redirectTo, router])

  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary-foreground">
      {redirectTo && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 text-black px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">
            需要登录才能访问: {redirectTo}
            {!loading && !user && (
              <span className="ml-2 text-red-500">（请先登录）</span>
            )}
            {loading && (
              <span className="ml-2 text-blue-500">（加载中...）</span>
            )}
          </p>
        </div>
      )}
      <Hero />
      <Features />
      <CTA />
    </main>
  )
}
