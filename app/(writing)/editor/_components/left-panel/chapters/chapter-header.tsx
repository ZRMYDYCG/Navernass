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
    <div className="h-9 px-2 flex items-center justify-between border-b border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
      <span className="text-xs font-medium text-muted-foreground truncate font-serif pl-1">
        {novelTitle || '未选择小说'}
      </span>

      <TooltipProvider>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCreateVolume}
                className="p-1.5 h-6 w-6 flex items-center justify-center hover:bg-sidebar-accent rounded-md transition-colors text-muted-foreground hover:text-sidebar-foreground"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95 z-[9999]">
              <p>新建卷</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCreateChapter}
                className="p-1.5 h-6 w-6 flex items-center justify-center hover:bg-sidebar-accent rounded-md transition-colors text-muted-foreground hover:text-sidebar-foreground"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95 z-[9999]">
              <p>新建章节</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onRefresh}
                className="p-1.5 h-6 w-6 flex items-center justify-center hover:bg-sidebar-accent rounded-md transition-colors text-muted-foreground hover:text-sidebar-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95 z-[9999]">
              <p>刷新</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCollapseAll}
                className="p-1.5 h-6 w-6 flex items-center justify-center hover:bg-sidebar-accent rounded-md transition-colors text-muted-foreground hover:text-sidebar-foreground"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95 z-[9999]">
              <p>收起全部</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
