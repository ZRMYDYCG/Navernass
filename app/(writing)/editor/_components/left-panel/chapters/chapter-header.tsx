'use client'

import { ChevronUp, FileText, Plus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useI18n } from '@/hooks/use-i18n'

interface ChapterHeaderProps {
  novelTitle?: string
  onCreateChapter?: () => void
  onCreateVolume?: () => void
  onCollapseAll?: () => void
}

export function ChapterHeader({
  novelTitle,
  onCreateChapter,
  onCreateVolume,
  onCollapseAll,
}: ChapterHeaderProps) {
  const { t } = useI18n()
  const actionButtonClass = 'p-1.5 h-6 w-6 flex items-center justify-center rounded-md border border-border/60 bg-background/60 text-primary/80 hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-colors'

  return (
    <div className="h-9 px-2 flex items-center justify-between border-b border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
      <span className="text-xs font-medium text-muted-foreground truncate font-serif pl-1">
        {novelTitle || t('editor.leftPanel.chapters.header.novelFallback')}
      </span>

      <TooltipProvider>
        <div className="flex items-center gap-0.5" data-chapter-header-actions>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCreateVolume}
                className={actionButtonClass}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95 z-[9999]">
              <p>{t('editor.leftPanel.chapters.header.newVolume')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCreateChapter}
                className={actionButtonClass}
              >
                <FileText className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95 z-[9999]">
              <p>{t('editor.leftPanel.chapters.header.newChapter')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCollapseAll}
                className={actionButtonClass}
              >
                <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95 z-[9999]">
              <p>{t('editor.leftPanel.chapters.header.collapseAll')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
