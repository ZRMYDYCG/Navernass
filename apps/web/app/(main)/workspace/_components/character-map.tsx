'use client'

import type { ChartConfig } from '@/components/ui/chart'
import type { CharacterMapItem } from '@/lib/supabase/sdk/types'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/hooks/use-i18n'
import { WorkspacePanel } from './workspace-panel'

interface CharacterMapProps {
  data?: CharacterMapItem[]
  isLoading?: boolean
}

export function CharacterMap({ data, isLoading }: CharacterMapProps) {
  const { t } = useI18n()

  const chartConfig = {
    characters: { label: t('workspace.dashboard.characterMap.characters'), color: 'var(--chart-1)' },
    relationships: { label: t('workspace.dashboard.characterMap.relationships'), color: 'var(--chart-2)' },
  } satisfies ChartConfig

  return (
    <WorkspacePanel
      title={t('workspace.dashboard.characterMap.title')}
      description={t('workspace.dashboard.characterMap.description')}
    >
      {isLoading || !data
        ? (
            <Skeleton className="h-[220px] w-full" />
          )
        : (
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
                barGap={2}
              >
                <CartesianGrid horizontal={false} className="stroke-border/30" />
                <YAxis
                  dataKey="title"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={72}
                  tick={{ fontSize: 11 }}
                />
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="characters" fill="var(--chart-1)" radius={[0, 2, 2, 0]} barSize={7}>
                  <LabelList dataKey="characters" position="right" className="fill-muted-foreground text-[10px]" />
                </Bar>
                <Bar dataKey="relationships" fill="var(--chart-2)" radius={[0, 2, 2, 0]} barSize={7}>
                  <LabelList dataKey="relationships" position="right" className="fill-muted-foreground text-[10px]" />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
    </WorkspacePanel>
  )
}
