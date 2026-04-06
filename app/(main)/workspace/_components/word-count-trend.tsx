'use client'

import type { WordCountTrendItem } from '@/lib/supabase/sdk/types'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useI18n } from '@/hooks/use-i18n'
import { Skeleton } from '@/components/ui/skeleton'

const chartConfig = {
  wordCount: { label: '字数', color: 'var(--chart-1)' },
} satisfies ChartConfig

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
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t('workspace.dashboard.wordCountTrend.title')}</CardTitle>
        <CardDescription>{t('workspace.dashboard.wordCountTrend.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-[240px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wordCountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area
                type="monotone"
                dataKey="wordCount"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#wordCountGradient)"
                dot={{ fill: 'var(--chart-1)', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
