'use client'

import { use } from 'react'
import { FontContext } from '@/context/font-provider'

export function useFontPreset() {
  const context = use(FontContext)
  if (context === undefined)
    throw new Error('useFontPreset must be used within a FontProvider')
  return context
}
