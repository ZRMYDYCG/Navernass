'use client'

import { use } from 'react'
import { ColorContext } from '@/context/color-provider'

export function useColorTheme() {
  const context = use(ColorContext)
  if (context === undefined)
    throw new Error('useColorTheme must be used within a ColorThemeProvider')
  return context
}
