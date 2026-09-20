'use client'

import { BookOpen, Edit3, MessageSquare, PenLine, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ActivityType = 'chapter' | 'novel' | 'chat' | 'edit' | 'ai'

const activities: {
  id: string
  type: ActivityType
  title: string
  subtitle: string
  time: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'outline'
}[] = [
  {
    id: '1',
    type: 'chapter',
    title: '更新章节《星陨之夜》',
    subtitle: '星际迷途 · 第 23 章',
    time: '2 小时前',
    badge: '2400字',
    badgeVariant: 'secondary',
  },
  {
    id: '2',
    type: 'ai',
    title: 'AI 协助生成场景描写',
    subtitle: '暗夜编年史 · 第 11 章',
    time: '5 小时前',
    badge: 'AI',
    badgeVariant: 'default',
  },
  {
    id: '3',
    type: 'chat',
    title: '与 AI 讨论世界观设定',
    subtitle: '龙裔传说 · 角色对话',
    time: '昨天 22:14',
    badge: '会话',
    badgeVariant: 'outline',
  },
  {
    id: '4',
    type: 'novel',
    title: '创建作品《迷雾森林》',
    subtitle: '奇幻 · 第一人称',
    time: '昨天 18:30',
  },
  {
    id: '5',
    type: 'edit',
    title: '修改第 8 章情节结构',
    subtitle: '彼岸之书 · 结构调整',
    time: '2天前',
    badge: '编辑',
    badgeVariant: 'outline',
  },
]

const iconMap: Record<ActivityType, React.ElementType> = {
  chapter: PenLine,
  novel: BookOpen,
  chat: MessageSquare,
  edit: Edit3,
  ai: Sparkles,
}

const iconBgMap: Record<ActivityType, string> = {
  chapter: 'bg-chart-1/15 text-chart-1',
  novel: 'bg-chart-2/15 text-chart-2',
  chat: 'bg-chart-4/15 text-chart-4',
  edit: 'bg-chart-3/15 text-chart-3',
  ai: 'bg-chart-5/15 text-chart-5',
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近动态</CardTitle>
        <CardDescription>近期创作记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type]
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', iconBgMap[activity.type])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    {activity.badge && (
                      <Badge variant={activity.badgeVariant ?? 'secondary'} className="shrink-0 text-xs">
                        {activity.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{activity.subtitle}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground/60 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
