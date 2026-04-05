'use client'

import type { WorkspaceStats } from '@/lib/supabase/sdk/workspace'
import { BookOpen, Edit3, Flame, Layers } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n, useLocale } from '@/hooks/use-i18n'
import { workspaceApi } from '@/lib/supabase/sdk/workspace'

export function StatsCard() {
  const { t } = useI18n()
  const { locale } = useLocale()
  const [stats, setStats] = useState<WorkspaceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    workspaceApi.getStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Skeleton className="h-[200px] w-full rounded-xl" />
  }

  const items = [
    {
      label: t('workspace.wordCount'),
      value: stats?.totalWordCount.toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US') || '0',
      icon: Edit3,
    },
    {
      label: t('workspace.statsCard.creationDays'),
      value: `${stats?.streak || 0} ${t('workspace.statsCard.days')}`,
      icon: Flame,
    },
    {
      label: t('workspace.statsCard.finishedChapters'),
      value: stats?.finishedChapterCount || '0',
      icon: BookOpen,
    },
    {
      label: t('workspace.statsCard.worldviewEntries'),
      value: stats?.characterCount || '0',
      icon: Layers,
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-paper-sm hover:shadow-paper-md transition-shadow duration-500">
      <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Flame className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-xl font-serif font-medium text-foreground/90 tracking-wide">
          {t('workspace.statsCard.title')}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-8">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 group">
            <div className="flex items-center gap-2 text-muted-foreground/70 group-hover:text-primary transition-colors duration-300">
              <item.icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium tracking-wide uppercase">{item.label}</span>
            </div>
            <div className="text-3xl font-bold tracking-tight font-serif text-foreground group-hover:scale-[1.02] origin-left transition-transform duration-300">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
