'use client'

import { TiptapEditor } from '@/components/tiptap/index'

export default function Hero() {
  return (
    <section className="min-h-screen flex justify-center flex-col overflow-hidden bg-background selection:bg-primary/10 selection:text-primary">
      <div className="max-w-4xl mx-auto text-center z-20 relative pt-8 sm:-mt-12">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-tight leading-[1.1]">
            让写作回归
            <span className="italic font-serif text-foreground/60 mx-2">纯粹</span>
            <span className="ml-2">与</span>
            <span className="italic font-serif text-foreground/60">自由</span>
          </h1>
        </div>

        <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto font-light leading-relaxed mt-4">
          我们专注为才华横溢的创作者打造舒适的创作环境，降低优质内容被看见、被分享、被发掘的门槛。同时也为新手提供AI辅助，降低直面感受创作、学习创作、走进创作的门槛。
        </p>
      </div>

      <div className="mx-auto z-20 relative pt-8 sm:pt-12 w-full max-w-4xl">
        <div className="bg-background p-2 w-full border border-border rounded-lg h-[500px]">
          <TiptapEditor
            placeholder="在这里开始你的创作之旅..."
            className="[&_.ProseMirror]:max-w-[65ch] [&_.ProseMirror]:mx-auto [&_.ProseMirror]:h-[480px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:overflow-y-auto"
          />
        </div>
      </div>
    </section>
  )
}
