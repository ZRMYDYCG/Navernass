'use client'

import { use } from 'react'
import { ThemeContext } from '@/components/providers/color-theme-context'

export function useColorTheme() {
  const context = use(ThemeContext)
  if (context === undefined)
    throw new Error('useColorTheme must be used within a ColorThemeProvider')
  return context
}
