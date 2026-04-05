'use client'

import { useLocale } from '@/hooks/use-i18n'

export function TextLocaleSwitcher() {
  const { locale, setLocale } = useLocale()

  const toggleLocale = () => {
    setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN')
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
    >
      {locale === 'zh-CN' ? 'EN' : '中'}
    </button>
  )
}
