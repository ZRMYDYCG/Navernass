'use client'

import type {
  ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const data = [
  { novel: '星际迷途', wordCount: 68200, target: 100000 },
  { novel: '暗夜编年史', wordCount: 45800, target: 80000 },
  { novel: '彼岸之书', wordCount: 32100, target: 60000 },
  { novel: '龙裔传说', wordCount: 87600, target: 120000 },
  { novel: '迷雾森林', wordCount: 21300, target: 50000 },
  { novel: '时间断层', wordCount: 31400, target: 70000 },
]

const chartConfig = {
  wordCount: {
    label: '当前字数',
    color: 'var(--chart-1)',
  },
  target: {
    label: '目标字数',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function WritingProgress() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>各作品进度</CardTitle>
        <CardDescription>当前字数 vs 目标字数</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart
            data={data}
            margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
            <XAxis
              dataKey="novel"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={v => `${(v / 10000).toFixed(0)}万`}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="target"
              fill="var(--chart-2)"
              radius={[3, 3, 0, 0]}
              opacity={0.25}
              barSize={18}
            />
            <Bar
              dataKey="wordCount"
              fill="var(--chart-1)"
              radius={[3, 3, 0, 0]}
              barSize={18}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
