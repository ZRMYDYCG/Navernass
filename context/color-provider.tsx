'use client'

import { createContext, useEffect, useMemo, useState } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const ColorContext = createContext<{
  colorTheme: string
  setColorTheme: (theme: string) => void
}>({
  colorTheme: 'default',
  setColorTheme: () => null,
})

export function ColorProvider({
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
    <ColorContext value={value}>
      {children}
    </ColorContext>
  )
}
