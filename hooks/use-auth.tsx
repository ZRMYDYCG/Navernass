'use client'

import type { RealtimeChannel, User } from '@supabase/supabase-js'
import { createContext, use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/index'

export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  website?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ data: any, error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any, error: any }>
  signOut: () => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
  setProfile: (profile: Profile | null) => void
}

const authContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfileByUserId = async (userId: string) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    try {
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Fetch profile timeout'))
        }, 10000)
      })

      const result = await Promise.race([profilePromise, timeoutPromise])

      if ('error' in result && result.error) {
        throw result.error
      }

      return result.data as Profile | null
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }

  useEffect(() => {
    let isMounted = true

    const minLoadingTime = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        setUser(session?.user ?? null)

        if (!session?.user) {
          if (isMounted) {
            setProfile(null)
            setLoading(false)
          }
          return
        }

        const shouldBlockLoading = event === 'SIGNED_IN' || event === 'INITIAL_SESSION'
        if (shouldBlockLoading && isMounted) {
          setLoading(true)
        }

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
          try {
            const profileData = shouldBlockLoading
              ? await Promise.all([
                  fetchProfileByUserId(session.user.id),
                  minLoadingTime(400),
                ]).then(([data]) => data)
              : await fetchProfileByUserId(session.user.id)

            if (isMounted) {
              setProfile(profileData)
            }
          } catch (error) {
            console.error('Error fetching profile:', error)
            if (isMounted && shouldBlockLoading) {
              setProfile(null)
            }
          } finally {
            if (isMounted && shouldBlockLoading) {
              setLoading(false)
            }
          }
        }
      },
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    if (user) {
      channel = supabase
        .channel(`profile:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            setProfile(payload.new as Profile)
          },
        )
        .subscribe()
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [user])

  const signUp = async (email: string, password: string) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    })
    return result
  }

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return result
  }

  const signOut = async () => {
    const result = await supabase.auth.signOut()
    return result
  }

  const refreshProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(data)
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    setProfile,
  }

  return (
    <authContext.Provider value={value}>
      {children}
    </authContext.Provider>
  )
}

export function useAuth() {
  const context = use(authContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
