'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

export function FaviconProvider() {
  const { theme, systemTheme } = useTheme()

  useEffect(() => {
    const updateFavicon = () => {
      const currentTheme = theme === 'system' ? systemTheme : theme
      const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement

      if (favicon) {
        favicon.href = currentTheme === 'dark'
          ? '/assets/svg/logo-light.svg'
          : '/assets/svg/logo-dark.svg'
      }
    }

    updateFavicon()
  }, [theme, systemTheme])

  return null
}
