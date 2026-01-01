'use client'

import { AiChatDemo } from './features/ai-chat-demo'
import { AnimatedBeamMultipleOutputDemo } from './features/multi-format-importer'
import { NovelManagement } from './features/novel-management'

export default function Features() {
  return (
    <>
      <section className="pb-20 flex flex-col  items-center l relative overflow-hidden min-h-screenbg-background">
        <div className="container mx-auto px-4">

          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground/80 tracking-wide">
              为创作者留下一方安静的书写角落
            </h2>

            <p className="mt-4 text-sm font-serif italic text-foreground/50 max-w-xl mx-auto leading-relaxed">
              每一个功能，都像放在桌边的小工具——温柔、不喧闹，只为让你写得更自在。
            </p>

            <div className="mt-8 w-14 h-[1.5px] bg-foreground/10 mx-auto rounded-full" />
          </div>
        </div>

        <div className="container mx-auto p-4">
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-5/12">
                <AiChatDemo />
              </div>

              <div className="w-full md:w-7/12">
                <NovelManagement />
              </div>
            </div>

            <div className="w-full h-full p-4 bg-card border border-border rounded-lg">
              <h3 className="text-lg">多格式导出</h3>
              <span className="text-sm text-muted-foreground mb-4">一键生成排版精美的 MarkDown 或 Text,从草稿到成书，只差一个按钮。</span>
              <AnimatedBeamMultipleOutputDemo />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
