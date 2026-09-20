'use client'

import type { Chapter, Volume } from '../types'
import { ChevronUp, FileText, Plus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { ImportExportButtons } from './import-export-buttons'

interface ChapterHeaderProps {
  novelTitle?: string
  novelId: string
  chapters: Chapter[]
  volumes: Volume[]
  onCreateChapter?: () => void
  onCreateVolume?: () => void
  allVolumesExpanded?: boolean
  hasVolumes?: boolean
  onToggleAllVolumes?: () => void
  onChaptersImported?: () => void
}

export function ChapterHeader({
  novelTitle,
  novelId,
  chapters,
  volumes,
  onCreateChapter,
  onCreateVolume,
  allVolumesExpanded = true,
  hasVolumes = false,
  onToggleAllVolumes,
  onChaptersImported,
}: ChapterHeaderProps) {
  const { t } = useI18n()
  const actionButtonClass = 'p-1.5 h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'

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
                onClick={onToggleAllVolumes}
                disabled={!hasVolumes}
                className={cn(actionButtonClass, !hasVolumes && 'opacity-40 pointer-events-none')}
              >
                <ChevronUp
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200 ease-out',
                    !allVolumesExpanded && 'rotate-180',
                  )}
                  strokeWidth={1.8}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95 z-[9999]">
              <p>
                {allVolumesExpanded
                  ? t('editor.leftPanel.chapters.header.collapseAll')
                  : t('editor.leftPanel.chapters.header.expandAll')}
              </p>
            </TooltipContent>
          </Tooltip>
          <ImportExportButtons
            chapters={chapters.map(c => ({ id: c.id, title: c.title }))}
            novelId={novelId}
            volumes={volumes}
            onChaptersImported={onChaptersImported}
            buttonClassName={actionButtonClass}
          />
        </div>
      </TooltipProvider>
    </div>
  )
}
