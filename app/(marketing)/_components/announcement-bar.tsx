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
    <div className="fixed top-0 left-0 right-0 z-[60] flex h-10 w-full items-center justify-center bg-zinc-900 text-zinc-100 border-b border-white/10">
      <div className="flex w-full items-center gap-4 overflow-hidden px-4">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase text-zinc-300">
          {t('marketing.announcement.tag')}
        </span>

        <Marquee gradient={false} speed={30} className="flex-1 text-sm font-light tracking-wide text-zinc-300">
          {items.map((it, idx) => (
            <span key={idx} className="mx-8 flex items-center gap-2">{it}</span>
          ))}
        </Marquee>

        <Link
          href="/survey"
          className="group flex shrink-0 items-center gap-1.5 text-xs font-medium text-zinc-100 hover:text-white transition-colors"
        >
          <span className="relative">
            {t('marketing.announcement.cta')}
            <span className="absolute left-0 -bottom-0.5 w-full h-px bg-zinc-500 group-hover:bg-white transition-colors"></span>
          </span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
