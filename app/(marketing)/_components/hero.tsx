'use client'

import { TiptapEditor } from '@/components/tiptap/index'
import { Highlighter } from '@/components/ui/highlighter'

export default function Hero() {
  return (
    <section className="min-h-screen flex justify-center flex-col overflow-hidden bg-background selection:bg-primary/10 selection:text-primary">

      {/* 主标题区域 */}
      <div className="max-w-4xl mx-auto text-center z-20 relative pt-24 sm:pt-32">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-tight leading-[1.1]">
            让写作回归
            <Highlighter action="underline" color="#87CEFA">纯粹</Highlighter>
            <span className="m-2">与</span>
            <Highlighter action="underline" color="#87CEFA">自由</Highlighter>
          </h1>
        </div>

        <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto font-light leading-relaxed mt-4">
          我们致力于为创作者提供舒适的创作环境，通过AI辅助降低创作和分享的门槛，帮助才华横溢的创作者与新手更容易展示和学习创作。
        </p>
      </div>

      <div className="mx-auto text-center z-20 relative pt-24 sm:pt-32 w-full">
        <div className=" bg-background p-4 shadow-md w-full">
          <TiptapEditor />
        </div>
      </div>
    </section>
  )
}
