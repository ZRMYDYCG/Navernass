'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

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
  const { t } = useI18n()

  return (
    <div className="hidden sm:flex items-center gap-2 h-full flex-1 justify-center max-w-2xl">
      <button
        type="button"
        onClick={onGoBack}
        disabled={!canGoBack}
        className={`p-1.5 h-8 w-8 flex items-center justify-center rounded-md transition-all duration-200 ${
          canGoBack
            ? 'bg-transparent text-foreground hover:bg-accent cursor-pointer'
            : 'bg-transparent text-muted-foreground cursor-not-allowed opacity-60'
        }`}
        title={t('editor.headerCenter.prevChapter')}
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
      </button>

      <div
        onClick={onTitleClick}
        className="group flex-1 max-w-[240px] h-7 px-3 flex items-center justify-center gap-2 rounded-md border border-border/60 bg-muted/50 text-sm text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
        title={t('editor.headerCenter.clickToSearch')}
      >
        <span className="truncate font-medium font-serif tracking-wide opacity-90 group-hover:opacity-100 transition-opacity">
          {title || t('editor.headerCenter.noChapterSelected')}
        </span>
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
        title={t('editor.headerCenter.nextChapter')}
      >
        <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
      </button>
    </div>
  )
}
