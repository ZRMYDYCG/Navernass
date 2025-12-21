'use client'

import { ArrowLeft, ArrowRight, Search } from 'lucide-react'

interface HeaderCenterProps {
  title: string
  canGoBack?: boolean
  canGoForward?: boolean
  onGoBack?: () => void
  onGoForward?: () => void
  onTitleClick?: () => void
}

export function HeaderCenter({
  title,
  canGoBack = false,
  canGoForward = false,
  onGoBack,
  onGoForward,
  onTitleClick,
}: HeaderCenterProps) {
  return (
    <div className="flex items-center gap-2 h-full flex-1 justify-center max-w-2xl">
      <button
        type="button"
        onClick={onGoBack}
        disabled={!canGoBack}
        className={`p-1.5 h-8 w-8 flex items-center justify-center rounded-md transition-all duration-200 ${
          canGoBack
            ? 'bg-transparent text-foreground hover:bg-accent cursor-pointer'
            : 'bg-transparent text-muted-foreground cursor-not-allowed opacity-60'
        }`}
        title="上一章节"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
      </button>

      <div
        onClick={onTitleClick}
        className="group flex-1 max-w-[240px] h-7 px-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        title="点击搜索章节"
      >
        <span className="truncate font-medium font-serif tracking-wide opacity-90 group-hover:opacity-100 transition-opacity">
          {title || '未选择章节'}
        </span>
        <Search className="w-3.5 h-3.5 mt-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300" strokeWidth={1.6} />
      </div>

      <button
        type="button"
        onClick={onGoForward}
        disabled={!canGoForward}
        className={`p-1.5 h-8 w-8 flex items-center justify-center rounded-md transition-all duration-200 ${
          canGoForward
            ? 'bg-transparent text-foreground hover:bg-accent cursor-pointer'
            : 'bg-transparent text-muted-foreground cursor-not-allowed opacity-60'
        }`}
        title="下一章节"
      >
        <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
      </button>
    </div>
  )
}
