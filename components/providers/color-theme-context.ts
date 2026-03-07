'use client'

import { createContext } from 'react'

export const ThemeContext = createContext<{
  colorTheme: string
  setColorTheme: (theme: string) => void
}>({
  colorTheme: 'default',
  setColorTheme: () => null,
})
