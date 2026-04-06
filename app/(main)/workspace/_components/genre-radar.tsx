'use client'

import type { ChartConfig } from '@/components/ui/chart'
import type { GenreRadarItem } from '@/lib/supabase/sdk/types'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {

  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/hooks/use-i18n'

interface GenreRadarProps {
  data?: GenreRadarItem[]
  isLoading?: boolean
}

export function GenreRadar({ data, isLoading }: GenreRadarProps) {
  const { t } = useI18n()

  const chartConfig = {
    draft: { label: t('workspace.dashboard.novelStatus.draft'), color: 'var(--chart-3)' },
    published: { label: t('workspace.dashboard.novelStatus.published'), color: 'var(--chart-1)' },
    archived: { label: t('workspace.dashboard.novelStatus.archived'), color: 'var(--chart-2)' },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('workspace.dashboard.genreRadar.title')}</CardTitle>
        <CardDescription>{t('workspace.dashboard.genreRadar.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data
          ? (
              <Skeleton className="mx-auto h-[240px] w-full" />
            )
          : (
              <ChartContainer config={chartConfig} className="mx-auto h-[240px]">
                <RadarChart data={data}>
                  <PolarGrid className="stroke-border/50" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Radar dataKey="published" fill="var(--chart-1)" fillOpacity={0.25} stroke="var(--chart-1)" strokeWidth={1.5} />
                  <Radar dataKey="draft" fill="var(--chart-3)" fillOpacity={0.15} stroke="var(--chart-3)" strokeWidth={1.5} />
                  <Radar dataKey="archived" fill="var(--chart-2)" fillOpacity={0.15} stroke="var(--chart-2)" strokeWidth={1.5} />
                  <ChartLegend content={<ChartLegendContent />} />
                </RadarChart>
              </ChartContainer>
            )}
      </CardContent>
    </Card>
  )
}
