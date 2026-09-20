export const LOCALE_OPTIONS = [
  {
    value: 'zh-CN',
    label: '简体中文',
    description: 'Mainland China',
    countryCode: 'CN',
    dictionaryLocale: 'zh-CN',
    openGraphLocale: 'zh_CN',
  },
  {
    value: 'zh-TW',
    label: '繁體中文',
    description: 'Taiwan',
    countryCode: 'TW',
    dictionaryLocale: 'zh-TW',
    openGraphLocale: 'zh_TW',
  },
  {
    value: 'en-US',
    label: 'English',
    description: 'United States',
    countryCode: 'US',
    dictionaryLocale: 'en-US',
    openGraphLocale: 'en_US',
  },
  {
    value: 'en-GB',
    label: 'English',
    description: 'United Kingdom',
    countryCode: 'GB',
    dictionaryLocale: 'en-GB',
    openGraphLocale: 'en_GB',
  },
  {
    value: 'ja-JP',
    label: '日本語',
    description: 'Japan',
    countryCode: 'JP',
    dictionaryLocale: 'ja-JP',
    openGraphLocale: 'ja_JP',
  },
  {
    value: 'ko-KR',
    label: '한국어',
    description: 'Korea',
    countryCode: 'KR',
    dictionaryLocale: 'ko-KR',
    openGraphLocale: 'ko_KR',
  },
  {
    value: 'fr-FR',
    label: 'Français',
    description: 'France',
    countryCode: 'FR',
    dictionaryLocale: 'fr-FR',
    openGraphLocale: 'fr_FR',
  },
  {
    value: 'de-DE',
    label: 'Deutsch',
    description: 'Germany',
    countryCode: 'DE',
    dictionaryLocale: 'de-DE',
    openGraphLocale: 'de_DE',
  },
] as const

export type Locale = (typeof LOCALE_OPTIONS)[number]['value']
export type DictionaryLocale = (typeof LOCALE_OPTIONS)[number]['dictionaryLocale']

export const LOCALES = LOCALE_OPTIONS.map(option => option.value) as Locale[]

export const DEFAULT_LOCALE: Locale = 'zh-CN'

export const LOCALE_DICTIONARY_MAP: Record<Locale, DictionaryLocale> = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'en-US': 'en-US',
  'en-GB': 'en-GB',
  'ja-JP': 'ja-JP',
  'ko-KR': 'ko-KR',
  'fr-FR': 'fr-FR',
  'de-DE': 'de-DE',
}

export const LOCALE_OPEN_GRAPH_MAP: Record<Locale, string> = {
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
  'en-US': 'en_US',
  'en-GB': 'en_GB',
  'ja-JP': 'ja_JP',
  'ko-KR': 'ko_KR',
  'fr-FR': 'fr_FR',
  'de-DE': 'de_DE',
}

export const LOCALE_COOKIE_KEY = 'locale'
export const LOCALE_STORAGE_KEY = 'locale'
