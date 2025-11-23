'use client'

import { ArrowLeft, ArrowRight, SearchCheck } from 'lucide-react'

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
      {/* 后退按钮 */}
      <button
        type="button"
        onClick={onGoBack}
        disabled={!canGoBack}
        className={`p-1.5 h-7 w-7 flex items-center justify-center rounded-full transition-all duration-200 ${
          canGoBack
            ? 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer'
            : 'text-stone-200 dark:text-stone-800 cursor-not-allowed opacity-50'
        }`}
        title="上一章节"
      >
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>

      {/* 标题搜索框 - 极简文本样式 */}
      <div
        onClick={onTitleClick}
        className="group flex-1 max-w-[240px] h-7 px-3 flex items-center justify-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer transition-colors"
        title="点击搜索章节"
      >
        <span className="truncate font-medium font-serif tracking-wide opacity-90 group-hover:opacity-100 transition-opacity">
          {title || '未选择章节'}
        </span>
        <SearchCheck className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity duration-300" strokeWidth={1.5} />
      </div>

      {/* 前进按钮 */}
      <button
        type="button"
        onClick={onGoForward}
        disabled={!canGoForward}
        className={`p-1.5 h-7 w-7 flex items-center justify-center rounded-full transition-all duration-200 ${
          canGoForward
            ? 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer'
            : 'text-stone-200 dark:text-stone-800 cursor-not-allowed opacity-50'
        }`}
        title="下一章节"
      >
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </div>
  )
}
