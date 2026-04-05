'use client'

import type { Locale } from '@/i18n/config'
import * as Flags from 'country-flag-icons/react/3x2'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { useI18n, useLocale } from '@/hooks/use-i18n'
import { LOCALE_OPTIONS } from '@/i18n/config'

function LocaleFlag({
  countryCode,
  label,
}: {
  countryCode: string
  label: string
}) {
  const Flag = Flags[countryCode as keyof typeof Flags]

  return (
    <Flag
      title={label}
      className="h-3.5 w-5 overflow-hidden rounded-[2px] shadow-sm"
    />
  )
}

export function TextLocaleSwitcher() {
  const { t } = useI18n()
  const { locale, setLocale } = useLocale()
  const currentOption = LOCALE_OPTIONS.find(option => option.value === locale) ?? LOCALE_OPTIONS[0]
  const currentLocaleLabel = t(`common.languages.${currentOption.value}`)

  return (
    <Select value={locale} onValueChange={value => setLocale(value as Locale)}>
      <SelectTrigger
        aria-label={t('settings.language')}
        className="h-9 w-auto min-w-40 gap-2 rounded-full border-0 bg-background/80 px-3 text-sm font-medium text-foreground shadow-none ring-0 focus:ring-0"
      >
        <div className="flex min-w-0 items-center gap-2">
          <LocaleFlag
            countryCode={currentOption.countryCode}
            label={`${currentLocaleLabel} · ${currentOption.description}`}
          />
          <span className="truncate">{currentLocaleLabel}</span>
        </div>
      </SelectTrigger>

      <SelectContent className="min-w-56">
        {LOCALE_OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value} className="py-2">
            <span className="flex items-center gap-3">
              <LocaleFlag
                countryCode={option.countryCode}
                label={`${t(`common.languages.${option.value}`)} · ${option.description}`}
              />
              <span className="flex items-center gap-2">
                <span className="font-medium text-foreground">{t(`common.languages.${option.value}`)}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
