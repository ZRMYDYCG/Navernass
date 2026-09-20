'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function useSuperAdmin() {
  const { user } = useAuth()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function checkAdmin() {
      if (!user) {
        if (!cancelled) {
          setIsSuperAdmin(false)
          setLoading(false)
        }
        return
      }

      try {
        const response = await fetch('/api/admin/me', {
          credentials: 'include',
          cache: 'no-store',
        })
        const result = await response.json()
        if (!cancelled) {
          setIsSuperAdmin(Boolean(result?.data?.isSuperAdmin))
        }
      } catch {
        if (!cancelled) {
          setIsSuperAdmin(false)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    setLoading(true)
    checkAdmin()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  return { isSuperAdmin, loading }
}
