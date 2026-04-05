import type { Locale } from './config'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LOCALE } from './config'
import deDE from './dicts/de-DE/index'
import enGB from './dicts/en-GB/index'
import enUS from './dicts/en-US/index'
import frFR from './dicts/fr-FR/index'
import jaJP from './dicts/ja-JP/index'
import koKR from './dicts/ko-KR/index'
import zhCN from './dicts/zh-CN/index'
import zhTW from './dicts/zh-TW/index'

export const resources = {
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  'en-US': { translation: enUS },
  'en-GB': { translation: enGB },
  'ja-JP': { translation: jaJP },
  'ko-KR': { translation: koKR },
  'fr-FR': { translation: frFR },
  'de-DE': { translation: deDE },
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
