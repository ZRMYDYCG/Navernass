'use client'

import { use } from 'react'
import { AuthContext } from '../context/auth-provider'

export function useAuth() {
  const context = use(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
