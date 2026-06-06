'use client'

import type { Chapter } from '@/lib/supabase/sdk'
import type { Volume } from '@/lib/supabase/sdk'
import { BookOpen, Check, FileText, User } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef } from 'react'
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
  variant?: 'popover' | 'drawer'
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
  variant = 'popover',
  className,
}: ChapterMentionMenuProps) {
  const { t } = useI18n()
  const isDrawer = variant === 'drawer'

  const chapterOrder = useMemo(() => {
    const map = new Map<string, number>()
    chapters.forEach((chapter, index) => map.set(chapter.id, index + 1))
    return map
  }, [chapters])

  const items = useMemo(
    () => filterMentionListItems(volumes, chapters, query, characters),
    [volumes, chapters, query, characters],
  )

  const activeItemRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, items.length])

  if (items.length === 0) {
    return (
      <div
        data-chapter-mention-menu
        className={cn(
          'text-center text-xs text-muted-foreground',
          isDrawer
            ? 'w-full px-3 py-4'
            : 'z-50 w-56 rounded-lg border border-border bg-card py-3 shadow-xl',
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
        'overflow-y-auto py-1',
        isDrawer
          ? 'input-area-scrollbar max-h-44 w-full'
          : 'z-50 max-h-52 w-56 rounded-lg border border-border bg-card shadow-xl',
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
              <div className={cn(
                'py-1 text-[10px] font-medium uppercase text-muted-foreground/70',
                isDrawer ? 'px-3' : 'px-2.5',
              )}
              >
                {t('editor.rightPanel.chapterSelector.volumesSection')}
              </div>
            )}
            {showChapterHeader && (
              <div className={cn(
                'py-1 text-[10px] font-medium uppercase text-muted-foreground/70',
                isDrawer ? 'px-3' : 'px-2.5',
              )}
              >
                {t('editor.rightPanel.chapterSelector.chaptersSection')}
              </div>
            )}
            {showCharacterHeader && (
              <div className={cn(
                'py-1 text-[10px] font-medium uppercase text-muted-foreground/70',
                isDrawer ? 'px-3' : 'px-2.5',
              )}
              >
                {t('editor.rightPanel.chapterSelector.charactersSection')}
              </div>
            )}
            <button
              ref={isActive ? activeItemRef : undefined}
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
                'flex w-full cursor-pointer items-center gap-2 py-1.5 text-left text-xs transition-colors',
                isDrawer ? 'px-3' : 'px-2.5',
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
