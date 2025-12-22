'use client'

import { TiptapEditor } from '@/components/tiptap/index'
import { Highlighter } from '@/components/ui/highlighter'

export default function Hero() {
  return (
    <section className="min-h-screen flex justify-center flex-col overflow-hidden bg-background selection:bg-primary/10 selection:text-primary px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center z-20 relative pt-16 sm:pt-20">
        <div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-tight leading-[1.1]">
            让写作回归
            <Highlighter action="underline" color="#87CEFA">纯粹</Highlighter>
            <span>与</span>
            <Highlighter action="underline" color="#87CEFA">自由</Highlighter>
          </h1>
        </div>

        <p className="text-base sm:text-xl text-foreground/60 max-w-2xl mx-auto font-light leading-relaxed mt-4 px-2 sm:px-0">
          我们专注为才华横溢的创作者打造舒适的创作环境，降低优质内容被看见、被分享、被发掘的门槛。同时也为新手提供AI辅助，降低直面感受创作、学习创作、走进创作的门槛。
        </p>

        <div className="mt-8 w-14 h-[1.5px] bg-foreground/10 mx-auto rounded-full" />
      </div>

      <div className="mx-auto z-20 relative pt-10 sm:pt-20 w-full max-w-4xl">
        <div className="bg-background p-2 w-full border border-border rounded-lg h-[400px] sm:h-[500px]">
          <TiptapEditor
            placeholder="在这里开始你的创作之旅..."
            content="如果有来世，就让我们做一对小小的老鼠，笨笨的相爱，呆呆的过日子，拙拙的相守，傻傻的在一起。即使大雪封山，还可以窝在暖暖的草堆，紧紧地抱着你，轻轻地咬你的耳朵。"
            className="[&_.ProseMirror]:max-w-[65ch] [&_.ProseMirror]:mx-auto [&_.ProseMirror]:h-[480px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:overflow-y-auto"
          />
        </div>
      </div>
    </section>
  )
}
