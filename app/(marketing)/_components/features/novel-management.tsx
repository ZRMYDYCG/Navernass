'use client'

import { ThemeVideo } from './theme-video'

export function NovelManagement() {
  return (
    <div className="w-full h-full p-4 bg-background border border-border rounded-lg flex flex-col items-center text-center">
      <div className="flex items-center justify-center mb-4">
        <h3 className="text-lg text-foreground">沉浸创作</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        创建、组织和编辑你的小说作品，支持章节管理、状态跟踪和发布控制
      </p>

      <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border bg-muted">
        <ThemeVideo
          lightSrc="/wirte-day.mp4"
          darkSrc="/wirte-night.mp4"
          posterSrc="/landing-page-2.png"
        />
      </div>
    </div>
  )
}
