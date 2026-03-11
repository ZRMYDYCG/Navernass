'use client'

import { Highlighter } from '@/components/ui/highlighter'
import { ThemeVideo } from './theme-video'

export function AiChatDemo() {
  return (
    <div className="w-full h-full p-4 bg-background rounded-lg flex flex-col items-center text-center">
      <h3 className="text-lg mb-3 text-foreground">
        <Highlighter action="underline" color="var(--primary)">创作助手</Highlighter>
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        与AI助手实时交流，获取创作灵感、优化建议和故事发展思路
      </p>

      <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border bg-muted">
        <ThemeVideo
          lightSrc="/ai-day.mp4"
          darkSrc="/ai-night.mp4"
          posterSrc="/landing-page-1.png"
        />
      </div>
    </div>
  )
}
