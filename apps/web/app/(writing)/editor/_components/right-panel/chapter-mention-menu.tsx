'use client'

import type { Chapter } from '@/lib/supabase/sdk'
import type { Volume } from '@/lib/supabase/sdk'
import { BookMarked, BookOpen, Check, Globe2, ListTree, User } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { setChapterAttachmentDragData, setVolumeAttachmentDragData } from '@/lib/editor/chapter-attachment-drag'
import { filterMentionListItems, type MentionListItem } from '@/lib/editor/inline-composer'

interface ChapterMentionMenuProps {
  volumes: Volume[]
  chapters: Chapter[]
  characters?: Array<{ id: string, name: string }>
  worldbookEntries?: Array<{ id: string, title: string }>
  outlines?: Array<{ id: string, title: string }>
  books?: Array<{ id: string, title: string }>
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
  worldbookEntries = [],
  outlines = [],
  books = [],
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
    () => filterMentionListItems(volumes, chapters, query, characters, worldbookEntries, outlines, books),
    [volumes, chapters, query, characters, worldbookEntries, outlines, books],
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

  let bookHeaderShown = false
  let volumeHeaderShown = false
  let chapterHeaderShown = false
  let characterHeaderShown = false
  let worldbookHeaderShown = false
  let outlineHeaderShown = false

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
        const showBookHeader = item.type === 'book' && !bookHeaderShown
        const showVolumeHeader = item.type === 'volume' && !volumeHeaderShown
        const showChapterHeader = item.type === 'chapter' && !chapterHeaderShown
        const showCharacterHeader = item.type === 'character' && !characterHeaderShown
        const showWorldbookHeader = item.type === 'worldbook' && !worldbookHeaderShown
        const showOutlineHeader = item.type === 'outline' && !outlineHeaderShown
        if (showBookHeader) bookHeaderShown = true
        if (showVolumeHeader) volumeHeaderShown = true
        if (showChapterHeader) chapterHeaderShown = true
        if (showCharacterHeader) characterHeaderShown = true
        if (showWorldbookHeader) worldbookHeaderShown = true
        if (showOutlineHeader) outlineHeaderShown = true

        return (
          <div key={`${item.type}-${item.id}-${index}`}>
            {showBookHeader && (
              <div className={cn(
                'py-1 text-[10px] font-medium uppercase text-muted-foreground/70',
                isDrawer ? 'px-3' : 'px-2.5',
              )}
              >
                {t('editor.rightPanel.chapterSelector.booksSection', '书本')}
              </div>
            )}
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
            {showWorldbookHeader && (
              <div className={cn(
                'py-1 text-[10px] font-medium uppercase text-muted-foreground/70',
                isDrawer ? 'px-3' : 'px-2.5',
              )}
              >
                {t('editor.rightPanel.chapterSelector.worldbookSection')}
              </div>
            )}
            {showOutlineHeader && (
              <div className={cn(
                'py-1 text-[10px] font-medium uppercase text-muted-foreground/70',
                isDrawer ? 'px-3' : 'px-2.5',
              )}
              >
                {t('editor.rightPanel.chapterSelector.outlinesSection')}
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
              {item.type === 'book'
                ? (
                    <BookMarked className="size-3 shrink-0 text-amber-500" aria-hidden />
                  )
                : item.type === 'volume'
                  ? (
                      <BookOpen className="size-3 shrink-0 text-primary/80" aria-hidden />
                    )
                  : item.type === 'character'
                    ? (
                        <User className="size-3 shrink-0 text-chart-2" aria-hidden />
                      )
                    : item.type === 'worldbook'
                      ? (
                          <Globe2 className="size-3 shrink-0 text-chart-3" aria-hidden />
                        )
                      : item.type === 'outline'
                        ? (
                            <ListTree className="size-3 shrink-0 text-chart-4" aria-hidden />
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
