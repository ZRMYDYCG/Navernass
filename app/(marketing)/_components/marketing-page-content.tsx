'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import Features from './features'
import Hero from './hero'
import Navbar from './navbar'

export default function MarketingPageContent() {
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

  useEffect(() => {
    if (redirectTo && !loading && user) {
      const timer = setTimeout(() => {
        if (hasRedirectedRef.current) {
          router.push(redirectTo)
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [user, loading, redirectTo, router])

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
      <Features />
    </main>
  )
}
