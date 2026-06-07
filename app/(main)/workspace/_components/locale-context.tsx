'use client'

import { MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocale } from '@/hooks/use-i18n'

function getTimezoneLabel(timeZone: string, locale: string, date: Date) {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    timeZoneName: 'longGeneric',
  }).formatToParts(date)

  const fromIntl = parts.find(part => part.type === 'timeZoneName')?.value
  if (fromIntl) return fromIntl

  return timeZone.split('/').pop()?.replace(/_/g, ' ') ?? timeZone
}

export function LocaleContext() {
  const { locale } = useLocale()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const { timeZone, timeZoneLabel, dateLabel, timeLabel } = useMemo(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    return {
      timeZone,
      timeZoneLabel: getTimezoneLabel(timeZone, locale, now),
      dateLabel: new Intl.DateTimeFormat(locale, {
        timeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(now),
      timeLabel: new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
      }).format(now),
    }
  }, [locale, now])

  return (
    <div
      className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-card/80 px-3 py-2 shadow-paper-sm backdrop-blur-[2px]"
      title={timeZone}
    >
      <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="flex min-w-0 flex-col leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-serif text-foreground">{timeZoneLabel}</span>
          <span className="text-xs tabular-nums text-muted-foreground">{timeLabel}</span>
        </div>
        <span className="truncate text-[11px] text-muted-foreground/80">{dateLabel}</span>
      </div>
    </div>
  )
}
