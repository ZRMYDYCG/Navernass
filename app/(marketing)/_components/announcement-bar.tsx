'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Marquee from 'react-fast-marquee'

export function AnnouncementBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex h-10 w-full items-center justify-center bg-zinc-900 text-zinc-100 border-b border-white/10">
      <div className="flex w-full items-center gap-4 overflow-hidden px-4">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase text-zinc-300">
          预告
        </span>

        <Marquee gradient={false} speed={30} className="flex-1 text-sm font-light tracking-wide text-zinc-300">
          <span className="mx-8 flex items-center gap-2">
            🚀 预告：我们将启动「全能型小说创作 Agent」开发计划，致力于打造业内最好用的 AI 写作助手。
          </span>
          <span className="mx-8 flex items-center gap-2">
            🤝 诚邀才华横溢的您加入共创！让我们建立开发者与用户的直通桥梁，您的经验将直接决定产品的形态。
          </span>
          <span className="mx-8 flex items-center gap-2">
            💎 您的每一条建议都弥足珍贵。加入 Narraverse，与我们共同迭代，为更多内容创作者赋能！
          </span>
        </Marquee>

        <Link
          href="/survey"
          className="group flex shrink-0 items-center gap-1.5 text-xs font-medium text-zinc-100 hover:text-white transition-colors"
        >
          <span className="relative">
            参与调研
            <span className="absolute left-0 -bottom-0.5 w-full h-px bg-zinc-500 group-hover:bg-white transition-colors"></span>
          </span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
