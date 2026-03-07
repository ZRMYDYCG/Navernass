'use client'

import { Feather, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function WelcomeCard() {
  const { user, profile } = useAuth()

  const hour = new Date().getHours()
  let greeting = '你好'
  if (hour < 12) greeting = '早安'
  else if (hour < 18) greeting = '午安'
  else greeting = '晚安'

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-8 shadow-paper-sm bg-paper-texture mb-8">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-muted-foreground/80">
            <Feather className="h-4 w-4" />
            <span className="text-sm font-medium tracking-wide">
              今日灵感 · 每一个伟大的故事都始于微小的念头
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground tracking-tight">
            {greeting}
            ，
            {profile?.full_name || profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '造梦者'}
            。
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed font-light">
            你的笔下有一个待探索的世界。今天想从哪里开始？是延续昨日的冒险，还是开启一段新的旅程？
          </p>
        </div>

        <div className="hidden md:block">
          <Sparkles className="h-24 w-24 text-primary/10 rotate-12" />
        </div>
      </div>
    </div>
  )
}
