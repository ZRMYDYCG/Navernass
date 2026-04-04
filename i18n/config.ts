export const LOCALES = ['zh-CN', 'en-US'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'zh-CN'

export const LOCALE_COOKIE_KEY = 'locale'
export const LOCALE_STORAGE_KEY = 'locale'
