'use client'

import type { ReactNode } from 'react'
import type { Locale } from '@/i18n/config'
import { useEffect, useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'
import { LOCALE_STORAGE_KEY } from '@/i18n/config'
import { createI18nInstance } from '@/i18n/utils'

interface I18nProviderProps {
  initialLocale: Locale
  children: ReactNode
}

export function I18nProvider({
  initialLocale,
  children,
}: I18nProviderProps) {
  const i18n = useMemo(() => createI18nInstance(initialLocale), [initialLocale])

  useEffect(() => {
    document.documentElement.lang = i18n.language

    const handleLanguageChanged = (lng: string) => {
      document.documentElement.lang = lng

      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, lng)
      } catch {}

      fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: lng }),
      }).catch(() => {})
    }

    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}
