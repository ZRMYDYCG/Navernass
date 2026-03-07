'use client'

import type { WorkspaceStats } from '@/lib/supabase/sdk/workspace'
import { BookOpen, Edit3, Flame, Layers } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { workspaceApi } from '@/lib/supabase/sdk/workspace'

export function StatsCard() {
  const [stats, setStats] = useState<WorkspaceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    workspaceApi.getStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Skeleton className="h-[200px] w-full rounded-xl" />
  }

  const items = [
    {
      label: '总字数',
      value: stats?.totalWordCount.toLocaleString() || '0',
      icon: Edit3,
    },
    {
      label: '创作天数',
      value: `${stats?.streak || 0} 天`,
      icon: Flame,
    },
    {
      label: '已完结章节',
      value: stats?.finishedChapterCount || '0',
      icon: BookOpen,
    },
    {
      label: '世界观条目',
      value: stats?.characterCount || '0',
      icon: Layers,
    },
  ]

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-serif font-medium mb-6 flex items-center gap-2">
        <span className="w-1 h-4 bg-primary rounded-full" />
        创作足迹
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-1 group">
            <div className="flex items-center gap-2 text-muted-foreground mb-1 group-hover:text-primary transition-colors">
              <item.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
            <div className="text-2xl font-semibold tracking-tight font-serif">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
