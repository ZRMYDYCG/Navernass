'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import Hero from './hero'
import JoinUs from './join-us'
import Navbar from './navbar'
import { Pricing } from './pricing'
import { Testimonials } from './testimonials'

const LazyFeatures = dynamic(() => import('./features'), {
  ssr: false,
  loading: () => (
    <section className="min-h-[70vh] bg-background px-4 py-20 md:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-8 w-56 rounded bg-muted" />
        <div className="h-5 w-full max-w-2xl rounded bg-muted/80" />
        <div className="h-[420px] rounded-lg border border-border bg-card/60" />
      </div>
    </section>
  ),
})

export default function MarketingPageContent() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    if (loading || hasRedirectedRef.current) return
    if (!user) return
    const redirectTo = new URLSearchParams(window.location.search).get('redirectTo')
    if (!redirectTo) return
    hasRedirectedRef.current = true
    router.replace(redirectTo)
  }, [user, loading, router])

  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary-foreground">
      <Navbar />
      <Hero />
      <LazyFeatures />
      <Pricing />
      <Testimonials />
      <JoinUs />
    </main>
  )
}
