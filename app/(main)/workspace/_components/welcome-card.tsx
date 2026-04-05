'use client'

import { format } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { Cloud, Coffee, Moon, Sun, Sunrise } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useI18n, useLocale } from '@/hooks/use-i18n'

function getTimeConfig() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 9) {
    return {
      key: 'morning',
      icon: Sunrise,
    }
  } else if (hour >= 9 && hour < 14) {
    return {
      key: 'noon',
      icon: Sun,
    }
  } else if (hour >= 14 && hour < 18) {
    return {
      key: 'afternoon',
      icon: Coffee,
    }
  } else if (hour >= 18 && hour < 22) {
    return {
      key: 'evening',
      icon: Cloud,
    }
  } else {
    return {
      key: 'night',
      icon: Moon,
    }
  }
}

export function WelcomeCard() {
  const { user, profile } = useAuth()
  const { t } = useI18n()
  const { locale } = useLocale()
  const [timeConfig, setTimeConfig] = useState(getTimeConfig())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeConfig(getTimeConfig())
    }, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const displayName = profile?.full_name
    || profile?.username
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || t('workspace.welcome.defaultName')

  const dateLocale = locale === 'zh-CN' ? zhCN : enUS
  const dateFormat = locale === 'zh-CN' ? 'yyyy年 MMMM do, EEEE' : 'EEEE, MMMM do, yyyy'
  const todayLabel = format(new Date(), dateFormat, { locale: dateLocale })
  const TimeIcon = timeConfig.icon

  const greeting = t(`workspace.welcome.timeConfig.${timeConfig.key}.greeting`)
  const message = t(`workspace.welcome.timeConfig.${timeConfig.key}.message`)

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 md:p-12 shadow-paper-sm bg-paper-texture group hover:shadow-paper-md transition-all duration-500">

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/30 border border-border/50">
            <TimeIcon className="h-4 w-4 text-primary" />
            <span suppressHydrationWarning className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {todayLabel}
            </span>
          </div>

          <div className="space-y-3">
            <h2 suppressHydrationWarning className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground leading-tight">
              <span suppressHydrationWarning className="opacity-80">{greeting}</span>
              {locale === 'zh-CN' ? '，' : ', '}
              <br className="hidden md:block" />
              <span className="text-primary">{displayName}</span>
              {locale === 'zh-CN' ? '。' : '.'}
            </h2>

            <p suppressHydrationWarning className="text-base md:text-lg leading-relaxed text-muted-foreground/80 max-w-2xl font-light">
              {message}
            </p>
          </div>
        </div>

        {/* Decorative element on the right */}
        <div className="hidden lg:flex items-center justify-center w-32 h-32 rounded-full border border-border/40 bg-secondary/10 shadow-inner group-hover:border-primary/20 transition-colors duration-700">
          <div className="w-24 h-24 rounded-full border border-dashed border-border/60 animate-[spin_60s_linear_infinite] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-border/80 animate-[spin_40s_linear_infinite_reverse] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary/60 shadow-[0_0_15px_rgba(0,0,0,0.2)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
