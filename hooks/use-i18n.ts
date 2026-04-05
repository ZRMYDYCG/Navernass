'use client'

import type { Locale } from '@/i18n/config'
import { useTranslation } from 'react-i18next'

export function useI18n() {
  const { t } = useTranslation()
  return { t }
}

export function useLocale() {
  const { i18n } = useTranslation()

  const setLocale = (locale: Locale) => {
    i18n.changeLanguage(locale)
  }

  return { locale: i18n.language as Locale, setLocale }
}
