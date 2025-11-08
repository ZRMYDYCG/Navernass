'use client'

import { BookOpen, FolderPlus, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChapterHeaderProps {
  onCreateChapter?: () => void
  onCreateVolume?: () => void
}

export function ChapterHeader({ onCreateChapter, onCreateVolume }: ChapterHeaderProps) {
  return (
    <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">目录</h2>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="新增"
            >
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onCreateChapter}>
              <BookOpen className="w-4 h-4 mr-2" />
              新增章节
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateVolume}>
              <FolderPlus className="w-4 h-4 mr-2" />
              新增卷
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
