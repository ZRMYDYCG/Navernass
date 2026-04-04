'use client'

import { useLocale } from '@/hooks/use-i18n'
import type { Locale } from '@/i18n/config'

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <select
      value={locale}
      onChange={e => setLocale(e.target.value as Locale)}
      className="rounded-[var(--radius)] border border-input bg-background px-2 py-1 text-sm text-foreground"
    >
      <option value="zh-CN">简体中文</option>
      <option value="en-US">English</option>
    </select>
  )
}
