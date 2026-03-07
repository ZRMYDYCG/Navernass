'use client'

import { use } from 'react'
import { AuthContext } from '@/providers/auth-provider'

export type { Profile } from '@/providers/auth-provider'

export function useAuth() {
  const context = use(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
