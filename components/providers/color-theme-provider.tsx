'use client'

import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './color-theme-context'

export function ColorThemeProvider({
  children,
  defaultTheme = 'default',
  storageKey = 'color-theme',
}: {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}) {
  const [colorTheme, setColorTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) || defaultTheme
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.setAttribute('data-theme', colorTheme)
    localStorage.setItem(storageKey, colorTheme)
  }, [colorTheme, storageKey])

  const value = useMemo(
    () => ({
      colorTheme,
      setColorTheme,
    }),
    [colorTheme],
  )

  return (
    <ThemeContext value={value}>
      {children}
    </ThemeContext>
  )
}
