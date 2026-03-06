'use client'

import { FolderOpen, Pencil, Plus } from 'lucide-react'

export function NovelManagement() {
  return (
    <div className="w-full h-full p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">沉浸创作</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        创建、组织和编辑你的小说作品，支持章节管理、状态跟踪和发布控制
      </p>

      <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border bg-muted">
        <video
          src="/wirte-night.mp4"
          className="w-full h-full object-cover dark:hidden"
          autoPlay
          loop
          muted
          playsInline
        />
        <video
          src="/wirte-day.mp4"
          className="w-full h-full object-cover hidden dark:block"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </div>
  )
}
