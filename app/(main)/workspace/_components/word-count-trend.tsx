'use client'

import type { WordCountTrendItem } from '@/lib/supabase/sdk/types'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useI18n } from '@/hooks/use-i18n'
import { Skeleton } from '@/components/ui/skeleton'
import { WorkspacePanel } from './workspace-panel'

interface WordCountTrendProps {
  data?: WordCountTrendItem[]
  isLoading?: boolean
}

export function WordCountTrend({ data, isLoading }: WordCountTrendProps) {
  const { t } = useI18n()

  const chartConfig = {
    wordCount: { label: t('workspace.dashboard.wordCountTrend.seriesLabel'), color: 'var(--chart-1)' },
  } satisfies ChartConfig

  return (
    <WorkspacePanel
      className="lg:col-span-2"
      title={t('workspace.dashboard.wordCountTrend.title')}
      description={t('workspace.dashboard.wordCountTrend.description')}
    >
      {isLoading || !data ? (
        <Skeleton className="h-[220px] w-full" />
      ) : (
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="wordCountGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              type="monotone"
              dataKey="wordCount"
              stroke="var(--chart-1)"
              strokeWidth={1.5}
              fill="url(#wordCountGradient)"
              dot={{ fill: 'var(--chart-1)', strokeWidth: 0, r: 2.5 }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </WorkspacePanel>
  )
}
