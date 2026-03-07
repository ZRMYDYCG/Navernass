'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Marquee from 'react-fast-marquee'

export function AnnouncementBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex h-10 w-full items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
      <div className="flex w-full items-center gap-4 overflow-hidden px-4">
        <span className="flex shrink-0 items-center gap-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
          <Sparkles className="h-3 w-3" />
          Coming Soon
        </span>

        <Marquee gradient={false} speed={40} className="flex-1 text-sm font-medium">
          <span className="mx-4">
            🚀 预告：我们将启动「全能型小说创作 Agent」开发计划，致力于打造业内最好用的 AI 写作助手。
          </span>
          <span className="mx-4">
            🤝 诚邀才华横溢的您加入共创！让我们建立开发者与用户的直通桥梁，您的经验将直接决定产品的形态。
          </span>
          <span className="mx-4">
            💎 您的每一条建议都弥足珍贵。加入 Narraverse，与我们共同迭代，为更多内容创作者赋能！
          </span>
        </Marquee>

        <Link
          href="/survey"
          className="group flex shrink-0 items-center gap-1 text-xs font-semibold hover:text-white/90 hover:underline decoration-white/50 underline-offset-4 transition-all"
        >
          参与调研
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
