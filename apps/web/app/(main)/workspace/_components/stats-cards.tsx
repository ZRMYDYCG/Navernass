'use client'

import type { WorkspaceStatsSummary } from '@/lib/supabase/sdk/types'
import { BookOpen, FileText, Hash, MessageSquare } from 'lucide-react'
import { PaperCard } from '@/components/ui/paper-card'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsCardsProps {
  data?: WorkspaceStatsSummary
  isLoading?: boolean
}

const statIcons = {
  novelCount: BookOpen,
  totalWordCount: Hash,
  totalChapterCount: FileText,
  conversationCount: MessageSquare,
} as const

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  const { t } = useI18n()

  const statDefs = [
    { key: 'novelCount' as const, title: t('workspace.dashboard.statsCards.novelCount'), label: t('workspace.dashboard.statsCards.novelCountLabel'), format: (v: number) => String(v) },
    { key: 'totalWordCount' as const, title: t('workspace.dashboard.statsCards.totalWordCount'), label: t('workspace.dashboard.statsCards.totalWordCountLabel'), format: (v: number) => v.toLocaleString() },
    { key: 'totalChapterCount' as const, title: t('workspace.dashboard.statsCards.totalChapterCount'), label: t('workspace.dashboard.statsCards.totalChapterCountLabel'), format: (v: number) => String(v) },
    { key: 'conversationCount' as const, title: t('workspace.dashboard.statsCards.conversationCount'), label: t('workspace.dashboard.statsCards.conversationCountLabel'), format: (v: number) => String(v) },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {statDefs.map((stat) => {
        const Icon = statIcons[stat.key]
        return (
          <PaperCard flat className="bg-paper-texture">
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{stat.title}</span>
                <Icon className="size-3.5 text-muted-foreground/50" aria-hidden />
              </div>
              {isLoading || !data ? (
                <>
                  <Skeleton className="mt-2 h-8 w-20" />
                  <Skeleton className="mt-2 h-3 w-28" />
                </>
              ) : (
                <>
                  <div className="mt-2 text-2xl font-serif font-medium tabular-nums text-foreground">
                    {stat.format(data[stat.key])}
                  </div>
                  <p className={cn('mt-1 text-[11px] italic text-muted-foreground/80')}>
                    {stat.label}
                  </p>
                </>
              )}
            </div>
          </PaperCard>
        )
      })}
    </div>
  )
}
