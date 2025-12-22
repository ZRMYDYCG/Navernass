'use client'

import { FolderOpen, Pencil, Plus } from 'lucide-react'

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

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative bg-secondary rounded-lg border border-border p-2.5 cursor-pointer hover:shadow-md transition-shadow group overflow-hidden">
            <div className="flex items-start justify-between mb-1.5 z-10 relative">
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 bg-background/80 backdrop-blur-sm">
                已发布
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded p-0.5">
                <Pencil className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
            <div className="h-20 rounded-md mb-1.5 overflow-hidden relative bg-muted">
              <img
                src="/landing-page-1.png"
                alt="程序 • 人生"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <h4 className="text-xs font-medium text-foreground mb-1 line-clamp-1">程序 • 人生</h4>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>12章</span>
              <span>·</span>
              <span>3.2万字</span>
            </div>
          </div>

          <div className="relative bg-secondary rounded-lg border border-border p-2.5 cursor-pointer hover:shadow-md transition-shadow group overflow-hidden">
            <div className="flex items-start justify-between mb-1.5 z-10 relative">
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-background/80 backdrop-blur-sm">
                草稿
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded p-0.5">
                <Pencil className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
            <div className="h-20 rounded-md mb-1.5 overflow-hidden relative bg-muted">
              <img
                src="/landing-page-2.png"
                alt="做个废物挺好的"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <h4 className="text-xs font-medium text-foreground mb-1 line-clamp-1">做个废物挺好的</h4>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>5章</span>
              <span>·</span>
              <span>1.1万字</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
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
    </div>
  )
}
