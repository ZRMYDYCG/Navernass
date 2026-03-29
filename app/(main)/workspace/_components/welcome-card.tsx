'use client'

import { CalendarDays, PenSquare } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function WelcomeCard() {
  const { user, profile } = useAuth()

  const hour = new Date().getHours()
  let greeting = '你好'
  if (hour < 12) greeting = '早安'
  else if (hour < 18) greeting = '午安'
  else greeting = '晚安'

  const displayName = profile?.full_name
    || profile?.username
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || '创作者'

  const todayLabel = new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date())

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-paper-sm bg-paper-texture md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-medium tracking-tight text-foreground md:text-3xl">
            {greeting}
            ，
            {displayName}
          </h2>

          <p className="text-sm leading-6 text-muted-foreground md:text-base">
            最近项目、创作数据和更新记录都在这里。
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground md:self-auto">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>{todayLabel}</span>
        </div>
      </div>
    </section>
  )
}
