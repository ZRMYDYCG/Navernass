'use client'

import type { RefObject } from 'react'
import type { Message } from '@/lib/supabase/sdk/types'
import { useMemo } from 'react'

import { cn } from '@/lib/utils'

interface ShareImageRendererProps {
  messages: Message[]
  title?: string
  containerRef: RefObject<HTMLDivElement | null>
}

export function ShareImageRenderer({ messages, title, containerRef }: ShareImageRendererProps) {
  const timestamp = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date())
    } catch {
      return new Date().toLocaleString()
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute -left-[1200px] top-0 pointer-events-none select-none" style={{ visibility: 'hidden' }}>
      <div className="w-[1080px] rounded-[48px] overflow-hidden bg-[#060915] text-white shadow-[0_50px_140px_rgba(6,9,21,0.55)] border border-white/5">
        <div className="relative px-16 py-14 bg-gradient-to-br from-[#0B1434] via-[#111F46] to-[#1E3A7C]">
          <div className="absolute inset-x-12 -top-32 h-64 bg-[radial-gradient(circle_at_top,rgba(102,132,255,0.28),transparent)] blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-6 py-2 text-sm uppercase tracking-[0.48em]">
                <span>精选对话</span>
              </div>
              <div className="space-y-3">
                <div className="text-[42px] leading-tight font-semibold tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
                  {title || '与 Narraverse 的灵感对话'}
                </div>
                <p className="text-lg text-white/70 max-w-[560px] leading-relaxed">
                  Narraverse 为你整理本轮对话的精彩瞬间，快分享给伙伴一起灵感爆发。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-[26px] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(126,157,255,0.7),rgba(49,73,155,0.2),rgba(126,157,255,0.7))] blur-2xl opacity-80" />
                <div className="relative w-[120px] h-[120px] rounded-[26px] bg-white flex items-center justify-center shadow-[0_20px_70px_rgba(25,54,129,0.45)] border border-white/60">
                  <img src="/assets/svg/logo-dark.svg" alt="Narraverse logo" className="w-20 h-20" crossOrigin="anonymous" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-16 py-14 bg-[#F7F8FF] space-y-8 text-[#0F1734]">
          <div className="flex items-center justify-between text-sm text-[#55609B]">
            <span>
              记录时间 ·
              {timestamp}
            </span>
            <span>
              共
              {messages.length}
              {' '}
              条对话
            </span>
          </div>

          <div className="space-y-10">
            {messages.map((message, index) => {
              const isUser = message.role === 'user'
              return (
                <div key={message.id} className="flex gap-6 items-start">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-[20px] flex items-center justify-center text-base font-semibold tracking-wide shadow-[0_18px_38px_rgba(15,23,52,0.12)]',
                      isUser ? 'bg-[#5E6CFF] text-white' : 'bg-white text-[#0F1734] border border-[#D6DBFF]',
                    )}
                  >
                    {isUser ? '我' : 'AI'}
                  </div>
                  <div
                    className={cn(
                      'flex-1 rounded-[32px] px-10 py-8 shadow-[0_24px_70px_rgba(15,23,52,0.12)] border border-transparent',
                      isUser ? 'bg-white text-[#0F1734] border-white/60' : 'bg-[#0F1734] text-white border-white/15',
                    )}
                  >
                    <div className="flex items-center justify-between text-sm opacity-70 mb-5">
                      <span>{isUser ? 'Narraverse 用户' : 'Narraverse AI 助手'}</span>
                      <span>
                        第
                        {index + 1}
                        {' '}
                        条
                      </span>
                    </div>
                    <div className="text-lg leading-8 whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[#0B1434] px-16 py-10 flex items-center justify-between text-white/70 text-sm tracking-wide border-t border-white/10">
          <div className="flex items-center gap-3">
            <img src="/assets/svg/logo-light.svg" alt="Narraverse logo" className="w-8 h-8" crossOrigin="anonymous" />
            <span>Narraverse · AI 创作工作室</span>
          </div>
          <span>灵感就在当下 · Keep Creating</span>
        </div>
      </div>
    </div>
  )
}
