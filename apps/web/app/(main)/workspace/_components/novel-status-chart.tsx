'use client'

import type { ChartConfig } from '@/components/ui/chart'
import type { NovelStatusItem } from '@/lib/supabase/sdk/types'
import { Cell, Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/hooks/use-i18n'
import { WorkspacePanel } from './workspace-panel'

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
    <WorkspacePanel
      title={t('workspace.dashboard.novelStatus.title')}
      description={t('workspace.dashboard.novelStatus.description')}
    >
      {isLoading || !data
        ? (
            <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full" />
          )
        : (
            <>
              <ChartContainer config={chartConfig} className="mx-auto h-[200px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={78}
                    paddingAngle={2}
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
              <div className="mt-3 grid grid-cols-3 gap-2 pt-1 text-center">
                {data.map(item => (
                  <div key={item.status} className="flex flex-col">
                    <span className="text-lg font-serif tabular-nums text-foreground">{item.value}</span>
                    <span className="text-[11px] text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
    </WorkspacePanel>
  )
}
