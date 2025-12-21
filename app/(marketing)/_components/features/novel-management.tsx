'use client'

import { BookOpen, FolderOpen, Pencil, Plus } from 'lucide-react'

export function NovelManagement() {
  return (
    <div className="w-full h-full p-4 shadow-md bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">小说管理</h3>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors cursor-pointer">
            <FolderOpen className="w-4 h-4 text-foreground" />
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        创建、组织和编辑你的小说作品，支持章节管理、状态跟踪和发布控制
      </p>

      {/* 小说卡片列表预览 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 小说卡片 1 */}
        <div className="relative bg-secondary rounded-lg border border-border p-3 cursor-pointer hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
              已发布
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center mb-2">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-xs font-medium text-foreground mb-1 line-clamp-1">星辰之约</h4>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>12章</span>
            <span>·</span>
            <span>3.2万字</span>
          </div>
        </div>

        {/* 小说卡片 2 */}
        <div className="relative bg-secondary rounded-lg border border-border p-3 cursor-pointer hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">
              草稿
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center mb-2">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-xs font-medium text-foreground mb-1 line-clamp-1">月光下的诗</h4>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>5章</span>
            <span>·</span>
            <span>1.1万字</span>
          </div>
        </div>
      </div>

      {/* 功能特性 */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground">
            章节管理
          </span>
          <span className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground">
            状态跟踪
          </span>
          <span className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground">
            一键发布
          </span>
        </div>
      </div>
    </div>
  )
}

