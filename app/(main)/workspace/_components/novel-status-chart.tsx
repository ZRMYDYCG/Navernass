'use client'

import type { ChartConfig } from '@/components/ui/chart'
import type { NovelStatusItem } from '@/lib/supabase/sdk/types'
import { Cell, Pie, PieChart } from 'recharts'
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

interface NovelStatusChartProps {
  data?: NovelStatusItem[]
  isLoading?: boolean
}

export function NovelStatusChart({ data, isLoading }: NovelStatusChartProps) {
  const { t } = useI18n()

  const chartConfig = {
    draft: { label: t('workspace.dashboard.novelStatus.draft'), color: 'var(--chart-3)' },
    published: { label: t('workspace.dashboard.novelStatus.published'), color: 'var(--chart-1)' },
    archived: { label: t('workspace.dashboard.novelStatus.archived'), color: 'var(--chart-2)' },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('workspace.dashboard.novelStatus.title')}</CardTitle>
        <CardDescription>{t('workspace.dashboard.novelStatus.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data
          ? (
              <Skeleton className="mx-auto h-[220px] w-[220px] rounded-full" />
            )
          : (
              <>
                <ChartContainer config={chartConfig} className="mx-auto h-[220px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {data.map(entry => (
                        <Cell
                          key={entry.status}
                          fill={chartConfig[entry.status as keyof typeof chartConfig]?.color}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                  </PieChart>
                </ChartContainer>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {data.map(item => (
                    <div key={item.status} className="flex flex-col">
                      <span className="text-lg font-bold text-foreground">{item.value}</span>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
      </CardContent>
    </Card>
  )
}
