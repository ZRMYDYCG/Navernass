'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import CTA from './cta'
import Features from './features/features'
import Hero from './hero'

export default function MarketingPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const hasRedirectedRef = useRef(false)
  const [isClientReady, setIsClientReady] = useState(false)

  const redirectTo = searchParams.get('redirectTo')

  useEffect(() => {
    setIsClientReady(true)
  }, [])

  useEffect(() => {
    if (!loading && user && redirectTo && !hasRedirectedRef.current && isClientReady) {
      hasRedirectedRef.current = true
      router.push(redirectTo)
    }
  }, [user, loading, redirectTo, router, isClientReady])

  useEffect(() => {
    if (isClientReady && redirectTo && !loading && user) {
      const timer = setTimeout(() => {
        if (hasRedirectedRef.current) {
          router.push(redirectTo)
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [user, loading, redirectTo, router, isClientReady])

  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary-foreground">
      <Hero />
      <Features />
      <CTA />
    </main>
  )
}
