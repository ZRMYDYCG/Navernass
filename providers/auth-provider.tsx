'use client'

import type { RealtimeChannel, User } from '@supabase/supabase-js'
import { createContext, useEffect, useState } from 'react'
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfileByUserId = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as Profile
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      return null
    }
  }

  useEffect(() => {
    let isMounted = true

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
            const profileData = await fetchProfileByUserId(session.user.id)

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
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch (err) {
      console.warn('server signout cleanup failed:', err)
    }
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
    <AuthContext value={value}>
      {children}
    </AuthContext>
  )
}
