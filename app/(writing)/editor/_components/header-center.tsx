'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    <div className="flex items-center gap-1.5 h-full flex-1 justify-center max-w-2xl">
      {/* 后退按钮 */}
      <button
        type="button"
        onClick={onGoBack}
        disabled={!canGoBack}
        className={`p-1 h-6 w-6 flex items-center justify-center rounded transition-colors ${
          canGoBack
            ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
            : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
        }`}
        title="上一章节"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* 标题搜索框 */}
      <button
        type="button"
        onClick={onTitleClick}
        className="flex-1 h-7 px-3 text-sm text-left text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded hover:border-gray-400 dark:hover:border-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        title="点击搜索章节"
      >
        <span className="truncate block">{title || '未选择章节'}</span>
      </button>

      {/* 前进按钮 */}
      <button
        type="button"
        onClick={onGoForward}
        disabled={!canGoForward}
        className={`p-1 h-6 w-6 flex items-center justify-center rounded transition-colors ${
          canGoForward
            ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
            : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
        }`}
        title="下一章节"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
