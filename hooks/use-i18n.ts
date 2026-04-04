'use client'

import { useTranslation } from 'react-i18next'
import type { Locale } from '@/i18n/config'

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
