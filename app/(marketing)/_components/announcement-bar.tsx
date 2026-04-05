'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Marquee from 'react-fast-marquee'
import { useI18n } from '@/hooks/use-i18n'

export function AnnouncementBar() {
  const { t } = useI18n()
  const rawItems = t('marketing.announcement.items', { returnObjects: true }) as unknown
  const items: string[] = Array.isArray(rawItems)
    ? rawItems as string[]
    : (typeof rawItems === 'string' ? [rawItems] : [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex h-10 w-full items-center justify-center bg-background/80 backdrop-blur-sm text-foreground border-b border-border/40">
      <div className="flex w-full items-center gap-4 overflow-hidden px-4">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase text-muted-foreground">
          {t('marketing.announcement.tag')}
        </span>

        <Marquee gradient={false} speed={30} className="flex-1 text-sm font-light tracking-wide text-foreground/80">
          {items.map((it, idx) => (
            <span key={idx} className="mx-8 flex items-center gap-2">{it}</span>
          ))}
        </Marquee>

        <Link
          href="/survey"
          className="group flex shrink-0 items-center gap-1.5 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          <span className="relative">
            {t('marketing.announcement.cta')}
            <span className="absolute left-0 -bottom-0.5 w-full h-px bg-foreground/30 group-hover:bg-foreground transition-colors"></span>
          </span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
