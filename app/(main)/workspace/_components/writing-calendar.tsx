'use client'

import type { CalendarDayItem } from '@/lib/supabase/sdk/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

const colorMap = [
  'bg-muted',
  'bg-chart-1/25',
  'bg-chart-1/50',
  'bg-chart-1/75',
  'bg-chart-1',
]

function countToLevel(count: number) {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}

function buildWeeks(data: CalendarDayItem[]) {
  // data is 84 days, sort by date
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const weeks: { date: string, count: number, dayOfWeek: number }[][] = []
  let week: { date: string, count: number, dayOfWeek: number }[] = []

  sorted.forEach((item) => {
    const dow = new Date(item.date).getDay() // 0=Sun
    week.push({ ...item, dayOfWeek: dow })
    if (dow === 6) {
      weeks.push(week)
      week = []
    }
  })
  if (week.length > 0) weeks.push(week)
  return weeks
}

function getMonthLabels(data: CalendarDayItem[]) {
  const seen = new Set<string>()
  const labels: string[] = []
  data.forEach((item) => {
    const d = new Date(item.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!seen.has(key)) {
      seen.add(key)
      labels.push(`${d.getMonth() + 1}月`)
    }
  })
  return labels
}

interface WritingCalendarProps {
  data?: CalendarDayItem[]
  isLoading?: boolean
}

export function WritingCalendar({ data, isLoading }: WritingCalendarProps) {
  const { t } = useI18n()

  const dayLabels = t('workspace.dashboard.writingCalendar.dayLabels', { returnObjects: true }) as unknown
  const labels = Array.isArray(dayLabels) ? dayLabels as string[] : ['一', '三', '五', '日']

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('workspace.dashboard.writingCalendar.title')}</CardTitle>
          <CardDescription>{t('workspace.dashboard.writingCalendar.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[120px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const weeks = buildWeeks(data)
  const months = getMonthLabels(data)
  const totalDays = data.filter(d => d.count > 0).length
  const totalUpdates = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-end justify-between">
          <div>
            <CardTitle>{t('workspace.dashboard.writingCalendar.title')}</CardTitle>
            <CardDescription>{t('workspace.dashboard.writingCalendar.description')}</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{totalDays}</span>
              {' '}
              {t('workspace.dashboard.writingCalendar.activeDays')}
            </span>
            <span>
              <span className="font-semibold text-foreground">{totalUpdates}</span>
              {' '}
              {t('workspace.dashboard.writingCalendar.updates')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Month labels */}
        <div className="mb-1 flex gap-1 pl-6">
          {months.map(m => (
            <div key={m} className="flex-1 text-[10px] text-muted-foreground/60">{m}</div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col justify-around pr-1">
            {labels.map(d => (
              <div key={d} className="flex h-[14px] items-center justify-end text-[10px] text-muted-foreground/60">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-1 gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-1 flex-col gap-1">
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = week.find(c => c.dayOfWeek === di)
                  return (
                    <div
                      key={di}
                      title={cell ? `${cell.date}: ${cell.count ? `${cell.count} ${t('workspace.dashboard.writingCalendar.updatesTip')}` : t('workspace.dashboard.writingCalendar.noActivity')}` : ''}
                      className={cn(
                        'aspect-square w-full rounded-[2px] transition-opacity hover:opacity-75',
                        cell ? colorMap[countToLevel(cell.count)] : 'bg-transparent',
                      )}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground/60">
          <span>{t('workspace.contributionGraph.less')}</span>
          {colorMap.map((cls, i) => (
            <div key={i} className={cn('h-3 w-3 rounded-[2px]', cls)} />
          ))}
          <span>{t('workspace.contributionGraph.more')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
