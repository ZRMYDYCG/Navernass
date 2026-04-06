'use client'

import type { ChartConfig } from '@/components/ui/chart'
import type { CharacterMapItem } from '@/lib/supabase/sdk/types'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/hooks/use-i18n'

const chartConfig = {
  characters: { label: '角色数', color: 'var(--chart-1)' },
  relationships: { label: '关系数', color: 'var(--chart-2)' },
} satisfies ChartConfig

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
    <Card>
      <CardHeader>
        <CardTitle>{t('workspace.dashboard.characterMap.title')}</CardTitle>
        <CardDescription>{t('workspace.dashboard.characterMap.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data
          ? (
              <Skeleton className="h-[240px] w-full" />
            )
          : (
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
                  barGap={2}
                >
                  <CartesianGrid horizontal={false} className="stroke-border/40" />
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
                  <Bar dataKey="characters" fill="var(--chart-1)" radius={[0, 3, 3, 0]} barSize={8}>
                    <LabelList dataKey="characters" position="right" className="fill-foreground text-[10px]" />
                  </Bar>
                  <Bar dataKey="relationships" fill="var(--chart-2)" radius={[0, 3, 3, 0]} barSize={8}>
                    <LabelList dataKey="relationships" position="right" className="fill-foreground text-[10px]" />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
      </CardContent>
    </Card>
  )
}
