'use client'

import type { ReactNode } from 'react'
import { ThemeProvider as ThemeContext } from 'next-themes'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeContext>
  )
}
