'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
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
    const redirectTo = new URLSearchParams(window.location.search).get('redirectTo')
    if (!loading && user && redirectTo && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true
      router.push(redirectTo)
    }
  }, [user, loading, router])

  useEffect(() => {
    const redirectTo = new URLSearchParams(window.location.search).get('redirectTo')
    if (redirectTo && !loading && user) {
      const timer = setTimeout(() => {
        if (hasRedirectedRef.current) {
          router.push(redirectTo)
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) { /* empty */ }
        } catch (error) {
          console.error('Error refreshing session:', error)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

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
