'use client'

import type { Chapter } from '@/lib/supabase/sdk'
import type { Volume } from '@/lib/supabase/sdk'
import { BookOpen, Check, FileText, User } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { setChapterAttachmentDragData, setVolumeAttachmentDragData } from '@/lib/editor/chapter-attachment-drag'
import { filterMentionListItems, type MentionListItem } from '@/lib/editor/inline-composer'

interface ChapterMentionMenuProps {
  volumes: Volume[]
  chapters: Chapter[]
  characters?: Array<{ id: string, name: string }>
  query: string
  activeIndex: number
  onSelect: (item: MentionListItem) => void
  onActiveIndexChange: (index: number) => void
  className?: string
}

export function ChapterMentionMenu({
  volumes,
  chapters,
  characters = [],
  query,
  activeIndex,
  onSelect,
  onActiveIndexChange,
  className,
}: ChapterMentionMenuProps) {
  const { t } = useI18n()

  const chapterOrder = useMemo(() => {
    const map = new Map<string, number>()
    chapters.forEach((chapter, index) => map.set(chapter.id, index + 1))
    return map
  }, [chapters])

  const items = useMemo(
    () => filterMentionListItems(volumes, chapters, query, characters),
    [volumes, chapters, query, characters],
  )

  if (items.length === 0) {
    return (
      <div
        data-chapter-mention-menu
        className={cn(
          'z-50 w-56 rounded-lg border border-border bg-card py-3 text-center text-xs text-muted-foreground shadow-xl',
          className,
        )}
      >
        {query
          ? t('editor.rightPanel.chapterSelector.noResults')
          : t('editor.rightPanel.chapterSelector.empty')}
      </div>
    )
  }

  let volumeHeaderShown = false
  let chapterHeaderShown = false
  let characterHeaderShown = false

  return (
    <div
      data-chapter-mention-menu
      className={cn(
        'z-50 max-h-52 w-56 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-xl',
        className,
      )}
      onMouseDown={e => e.preventDefault()}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex
        const showVolumeHeader = item.type === 'volume' && !volumeHeaderShown
        const showChapterHeader = item.type === 'chapter' && !chapterHeaderShown
        const showCharacterHeader = item.type === 'character' && !characterHeaderShown
        if (showVolumeHeader) volumeHeaderShown = true
        if (showChapterHeader) chapterHeaderShown = true
        if (showCharacterHeader) characterHeaderShown = true

        return (
          <div key={`${item.type}-${item.id}-${index}`}>
            {showVolumeHeader && (
              <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                {t('editor.rightPanel.chapterSelector.volumesSection')}
              </div>
            )}
            {showChapterHeader && (
              <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                {t('editor.rightPanel.chapterSelector.chaptersSection')}
              </div>
            )}
            {showCharacterHeader && (
              <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                {t('editor.rightPanel.chapterSelector.charactersSection')}
              </div>
            )}
            <button
              type="button"
              draggable
              onMouseEnter={() => onActiveIndexChange(index)}
              onDragStart={(e) => {
                if (item.type === 'volume') {
                  setVolumeAttachmentDragData(e.dataTransfer, {
                    id: item.id,
                    title: item.title,
                  })
                } else {
                  setChapterAttachmentDragData(e.dataTransfer, {
                    id: item.id,
                    title: item.title,
                  })
                }
              }}
              onClick={() => onSelect(item)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 text-left text-xs transition-colors',
                isActive ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              {item.type === 'volume'
                ? (
                    <BookOpen className="size-3 shrink-0 text-primary/80" aria-hidden />
                  )
                : item.type === 'character'
                  ? (
                      <User className="size-3 shrink-0 text-chart-2" aria-hidden />
                    )
                  : (
                      <span className="w-4 shrink-0 text-[10px] tabular-nums text-muted-foreground/70">
                        {chapterOrder.get(item.id) || '·'}
                      </span>
                    )}
              <span className="min-w-0 flex-1 truncate">
                {item.type === 'character' ? item.name : item.title}
              </span>
              {isActive && <Check className="size-3 shrink-0 text-foreground/70" strokeWidth={2.5} />}
            </button>
          </div>
        )
      })}
    </div>
  )
}
