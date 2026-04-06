'use client'

import type { WorkspaceStatsSummary } from '@/lib/supabase/sdk/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/hooks/use-i18n'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsCardsProps {
  data?: WorkspaceStatsSummary
  isLoading?: boolean
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  const { t } = useI18n()

  const statDefs = [
    { key: 'novelCount' as const, title: t('workspace.dashboard.statsCards.novelCount'), label: t('workspace.dashboard.statsCards.novelCountLabel'), format: (v: number) => String(v) },
    { key: 'totalWordCount' as const, title: t('workspace.dashboard.statsCards.totalWordCount'), label: t('workspace.dashboard.statsCards.totalWordCountLabel'), format: (v: number) => v.toLocaleString() },
    { key: 'totalChapterCount' as const, title: t('workspace.dashboard.statsCards.totalChapterCount'), label: t('workspace.dashboard.statsCards.totalChapterCountLabel'), format: (v: number) => String(v) },
    { key: 'conversationCount' as const, title: t('workspace.dashboard.statsCards.conversationCount'), label: t('workspace.dashboard.statsCards.conversationCountLabel'), format: (v: number) => String(v) },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statDefs.map((stat) => (
        <Card key={stat.key} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <>
                <Skeleton className="mb-2 h-8 w-24" />
                <Skeleton className="h-3 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{stat.format(data[stat.key])}</div>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
