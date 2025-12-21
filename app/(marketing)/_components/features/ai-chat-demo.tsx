'use client'

import { Bot, User } from 'lucide-react'

export function AiChatDemo() {
  return (
    <div className="w-full h-full p-4 shadow-md bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-foreground">AI 智能对话</h3>
      <p className="text-sm text-muted-foreground mb-4">
        与AI助手实时交流，获取创作灵感、优化建议和故事发展思路
      </p>

      {/* 对话示例 */}
      <div className="space-y-3 max-h-[280px] overflow-y-auto">
        {/* 用户消息 */}
        <div className="flex gap-2 justify-end">
          <div className="max-w-[80%]">
            <div className="bg-primary text-primary-foreground rounded-2xl px-3 py-2 text-sm">
              如何让角色对话更生动？
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>

        {/* AI消息 */}
        <div className="flex gap-2 justify-start">
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 text-foreground" />
          </div>
          <div className="max-w-[80%]">
            <div className="bg-secondary text-foreground rounded-2xl px-3 py-2 text-sm">
              可以让角色使用口语化表达，加入语气词和停顿，让对话更自然流畅...
            </div>
          </div>
        </div>

        {/* 用户消息 */}
        <div className="flex gap-2 justify-end">
          <div className="max-w-[80%]">
            <div className="bg-primary text-primary-foreground rounded-2xl px-3 py-2 text-sm">
              能帮我续写这段吗？
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>

        {/* AI消息 - 打字效果 */}
        <div className="flex gap-2 justify-start">
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 text-foreground" />
          </div>
          <div className="max-w-[80%]">
            <div className="bg-secondary text-foreground rounded-2xl px-3 py-2 text-sm">
              <span className="inline-block">正在思考</span>
              <span className="inline-flex gap-1 ml-1">
                <span className="w-1 h-1 bg-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
