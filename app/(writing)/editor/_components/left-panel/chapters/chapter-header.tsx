'use client'

import { BookOpen, ChevronDown, FolderPlus, RefreshCw } from 'lucide-react'

interface ChapterHeaderProps {
  onCreateChapter?: () => void
  onCreateVolume?: () => void
  onRefresh?: () => void
  onCollapseAll?: () => void
}

export function ChapterHeader({
  onCreateChapter,
  onCreateVolume,
  onRefresh,
  onCollapseAll,
}: ChapterHeaderProps) {
  return (
    <div className="h-8 px-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">目录</span>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onCreateVolume}
          className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          title="新建卷"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onCreateChapter}
          className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          title="新建章节"
        >
          <BookOpen className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          title="刷新"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          title="收起全部"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
