'use client'

import type { ActivityItem } from '@/lib/supabase/sdk/workspace'
import { addDays, eachDayOfInterval, endOfWeek, format, startOfWeek, subWeeks } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { workspaceApi } from '@/lib/supabase/sdk/workspace'
import { cn } from '@/lib/utils'

export function ContributionGraph() {
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
                      {format(day, 'yyyy年MM月dd日', { locale: zhCN })}
                      :
                      {count > 0 ? ` ${count} 次更新` : ' 无活动'}
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
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-serif font-medium text-foreground">
            创作节律
            <span className="ml-2 text-sm font-normal text-muted-foreground">{yearDisplay}</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">记录每一次灵感的迸发</p>
        </div>
        <div className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
          本周 +
          {currentWeekActivityDays}
          {' '}
          天
        </div>
      </div>

      {loading
        ? (
            <div className="h-[100px] flex items-center justify-center text-muted-foreground text-xs">
              加载中...
            </div>
          )
        : (
            renderGrid()
          )}

      <div className="flex items-center justify-end mt-4 gap-2 text-[10px] text-muted-foreground">
        <span>沉淀</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-sm bg-secondary dark:bg-muted/20" />
          <div className="w-2 h-2 rounded-sm bg-primary/40" />
          <div className="w-2 h-2 rounded-sm bg-primary/80" />
        </div>
        <span>心流</span>
      </div>
    </div>
  )
}
