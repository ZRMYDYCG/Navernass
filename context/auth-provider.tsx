'use client'

import type { RealtimeChannel, User } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
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

interface AuthProviderProps {
  children: ReactNode
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
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
        // 行不存在或刚注册尚未触发 trigger 时返回 null，不要打印为错误
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error)
        }
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
    let initialized = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        const nextUser = session?.user ?? null
        setUser(nextUser)

        if (!nextUser) {
          setProfile(null)
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
            setLoading(false)
            initialized = true
          }
          return
        }

        // SIGNED_IN / INITIAL_SESSION 需要拉 profile；TOKEN_REFRESHED 时复用现有 profile，避免多次刷新
        const needsProfile
          = event === 'SIGNED_IN'
            || event === 'INITIAL_SESSION'
            || event === 'USER_UPDATED'

        if (needsProfile) {
          try {
            const profileData = await fetchProfileByUserId(nextUser.id)
            if (isMounted) setProfile(profileData)
          } finally {
            if (isMounted) {
              setLoading(false)
              initialized = true
            }
          }
        } else if (!initialized && isMounted) {
          setLoading(false)
          initialized = true
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
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const signOut = async () => {
    // 先调用服务端清理 cookie（此时浏览器仍持有 session cookie），再清本地 session
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      })
    } catch (err) {
      console.warn('server signout cleanup failed:', err)
    }

    const result = await supabase.auth.signOut()

    // 双保险：立即同步本地状态，避免下游 UI 在 auth state 事件到达前看到旧用户
    setUser(null)
    setProfile(null)

    return result
  }

  const refreshProfile = async () => {
    if (!user) return

    const data = await fetchProfileByUserId(user.id)
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
