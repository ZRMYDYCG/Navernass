'use client'

import { BookOpen, FolderPlus, Minus, RefreshCw } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ChapterHeaderProps {
  novelTitle?: string
  onCreateChapter?: () => void
  onCreateVolume?: () => void
  onRefresh?: () => void
  onCollapseAll?: () => void
}

export function ChapterHeader({
  novelTitle,
  onCreateChapter,
  onCreateVolume,
  onRefresh,
  onCollapseAll,
}: ChapterHeaderProps) {
  return (
    <div className="h-7 px-1.5 flex items-center justify-between bg-gray-100 dark:bg-gray-800">
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
        {novelTitle || '未选择小说'}
      </span>

      <TooltipProvider>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCreateVolume}
                className="p-0.5 h-5 w-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <FolderPlus className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>新建卷</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCreateChapter}
                className="p-0.5 h-5 w-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <BookOpen className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>新建章节</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onRefresh}
                className="p-0.5 h-5 w-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>刷新</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCollapseAll}
                className="p-0.5 h-5 w-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Minus className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>收起全部</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
