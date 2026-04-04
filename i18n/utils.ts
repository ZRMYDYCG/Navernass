import type { Locale } from './config'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LOCALE } from './config'
import enUS from './dicts/en-US/index'
import zhCN from './dicts/zh-CN/index'

export const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
} as const

export function createI18nInstance(locale: Locale = DEFAULT_LOCALE) {
  const instance = i18next.createInstance()

  instance.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: {
      escapeValue: false,
    },
  })

  return instance
}
