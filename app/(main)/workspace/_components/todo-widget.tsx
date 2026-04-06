'use client'

import { AlertCircle, CheckCircle2, Circle, Clock } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Priority = 'high' | 'medium' | 'low'

const todos: {
  id: string
  content: string
  completed: boolean
  priority: Priority
}[] = [
  { id: '1', content: '完成《星际迷途》第 24 章草稿', completed: false, priority: 'high' },
  { id: '2', content: '修改《暗夜编年史》人物弧线设计', completed: false, priority: 'high' },
  { id: '3', content: '整理世界观设定文档', completed: true, priority: 'medium' },
  { id: '4', content: '研究古典神话素材', completed: false, priority: 'medium' },
  { id: '5', content: '校对《彼岸之书》前三章', completed: true, priority: 'low' },
  { id: '6', content: '规划《龙裔传说》第四卷大纲', completed: false, priority: 'low' },
]

const priorityConfig: Record<Priority, { label: string, icon: React.ElementType, className: string }> = {
  high: { label: '高', icon: AlertCircle, className: 'text-destructive' },
  medium: { label: '中', icon: Clock, className: 'text-chart-3' },
  low: { label: '低', icon: Circle, className: 'text-muted-foreground' },
}

export function TodoWidget() {
  const completed = todos.filter(t => t.completed).length
  const total = todos.length
  const percentage = Math.round((completed / total) * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>写作待办</CardTitle>
            <CardDescription className="mt-1">
              已完成
              {' '}
              {completed}
              {' '}
              /
              {' '}
              {total}
              {' '}
              项
            </CardDescription>
          </div>
          <div className="relative flex h-12 w-12 items-center justify-center">
            <svg className="h-12 w-12 -rotate-90 transform" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="var(--chart-2)"
                strokeWidth="3"
                strokeDasharray={`${percentage * 0.879} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-semibold text-foreground">
              {percentage}
              %
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {todos.map((todo) => {
            const PriorityIcon = priorityConfig[todo.priority].icon
            return (
              <div key={todo.id} className="flex items-center gap-3">
                {todo.completed
                  ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-chart-2" />
                    )
                  : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                <span
                  className={cn(
                    'flex-1 text-sm leading-snug',
                    todo.completed
                      ? 'text-muted-foreground/60 line-through'
                      : 'text-foreground',
                  )}
                >
                  {todo.content}
                </span>
                <PriorityIcon
                  className={cn('h-3.5 w-3.5 shrink-0', priorityConfig[todo.priority].className)}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
