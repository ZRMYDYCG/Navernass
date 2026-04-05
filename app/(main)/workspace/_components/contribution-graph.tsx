'use client'

import type { ActivityItem } from '@/lib/supabase/sdk/workspace'
import { addDays, eachDayOfInterval, endOfWeek, format, startOfWeek, subWeeks } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n, useLocale } from '@/hooks/use-i18n'
import { workspaceApi } from '@/lib/supabase/sdk/workspace'
import { cn } from '@/lib/utils'

export function ContributionGraph() {
  const { t } = useI18n()
  const { locale } = useLocale()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    workspaceApi.getActivity()
      .then(setActivities)
      .catch((error) => {
        console.error('Failed to load activity:', error)
        setActivities([])
      })
      .finally(() => setLoading(false))
  }, [])

  // Calculate stats for current week
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
  const currentWeekActivityDays = activities.filter((a) => {
    const date = new Date(a.date)
    return date >= startOfCurrentWeek && date <= today
  }).length

  // Generate a grid of weeks
  // 20 weeks to match the design
  const weeksCount = 20
  const endDate = endOfWeek(today, { weekStartsOn: 1 })
  const startDate = startOfWeek(subWeeks(today, weeksCount - 1), { weekStartsOn: 1 })

  const allDays = eachDayOfInterval({ start: startDate, end: endDate })

  // Group days into weeks
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  allDays.forEach((day) => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  // Create a map for quick lookup
  const activityMap = new Map<string, ActivityItem>()
  activities.forEach((item) => {
    activityMap.set(item.date, item)
  })

  // Calculate date range for display
  const startYear = startDate.getFullYear()
  const endYear = endDate.getFullYear()
  const yearDisplay = startYear === endYear ? startYear : `${startYear}-${endYear}`

  const renderGrid = () => {
    return (
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
        {weeks.map((weekDays, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-1">
            {weekDays.map((day, dIndex) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const activity = activityMap.get(dateStr)
              const level = activity?.level || 0
              const count = activity?.count || 0

              return (
                <TooltipProvider key={dIndex}>
                  <Tooltip delayDuration={50}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-default',
                          level === 0 && 'bg-secondary dark:bg-muted/20',
                          level === 1 && 'bg-primary/20',
                          level === 2 && 'bg-primary/40',
                          level === 3 && 'bg-primary/60',
                          level >= 4 && 'bg-primary/80',
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {format(day, locale === 'zh-CN' ? 'yyyy年MM月dd日' : 'MMM d, yyyy', { locale: locale === 'zh-CN' ? zhCN : enUS })}
                      :
                      {count > 0 ? ` ${count} ${t('workspace.contributionGraph.updates')}` : ` ${t('workspace.contributionGraph.noActivity')}`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-paper-sm hover:shadow-paper-md transition-shadow duration-500">
      <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
        <h3 className="text-xl font-serif font-medium text-foreground/90 tracking-wide">
          {t('workspace.contributionGraph.title')}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground/70 bg-secondary/30 px-3 py-1.5 rounded-full border border-border/50">
          <span className="h-2 w-2 rounded-full bg-primary/80 animate-pulse" />
          {t('workspace.contributionGraph.activeDays')}
          {' '}
          <span className="font-bold text-foreground mx-1">{currentWeekActivityDays}</span>
          {' '}
          {t('workspace.contributionGraph.days')}
        </div>
      </div>

      {loading
        ? (
            <div className="flex gap-2">
              {[...Array.from({ length: 20 })].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  {[...Array.from({ length: 7 })].map((_, j) => (
                    <div key={j} className="w-3 h-3 rounded-sm bg-muted animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          )
        : (
            <div className="flex flex-col">
              {renderGrid()}
              <div className="flex items-center justify-between mt-6 text-xs text-muted-foreground/60 font-mono uppercase tracking-widest">
                <span>{yearDisplay}</span>
                <div className="flex items-center gap-2">
                  <span>{t('workspace.contributionGraph.less')}</span>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-secondary dark:bg-muted/20" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/40" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/80" />
                  </div>
                  <span>{t('workspace.contributionGraph.more')}</span>
                </div>
              </div>
            </div>
          )}
    </div>
  )
}
