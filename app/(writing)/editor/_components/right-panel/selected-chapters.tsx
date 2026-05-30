'use client'

import type { Chapter } from '@/lib/supabase/sdk'
import { X } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface SelectedChaptersProps {
  chapters: Chapter[]
  onRemove: (chapterId: string) => void
}

export function SelectedChapters({ chapters, onRemove }: SelectedChaptersProps) {
  const { t } = useI18n()

  if (chapters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {chapters.map(chapter => (
        <span
          key={chapter.id}
          className={cn(
            'inline-flex items-center gap-1 max-w-full pl-2 pr-1 py-0.5',
            'rounded-md bg-secondary/80 text-secondary-foreground text-[11px]',
          )}
        >
          <span className="truncate" title={chapter.title}>
            {chapter.title}
          </span>
          <button
            type="button"
            onClick={() => onRemove(chapter.id)}
            className="p-0.5 rounded hover:bg-background/40 transition-colors shrink-0"
            title={t('editor.rightPanel.remove')}
          >
            <X className="w-2.5 h-2.5 opacity-60" />
          </button>
        </span>
      ))}
    </div>
  )
}
