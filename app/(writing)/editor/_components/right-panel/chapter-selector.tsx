'use client'

import type { Chapter } from '@/lib/supabase/sdk'
import { AtSign, Check, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { setChapterAttachmentDragData } from '@/lib/editor/chapter-attachment-drag'
import { selectOrderedChapters, useAppStore } from '@/store'

interface ChapterMentionPickerProps {
  selectedChapters: Chapter[]
  onSelectionChange: (chapters: Chapter[]) => void
  disabled?: boolean
}

export function ChapterMentionPicker({
  selectedChapters,
  onSelectionChange,
  disabled,
}: ChapterMentionPickerProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const chapters = useAppStore(useShallow(selectOrderedChapters))
  const hydrated = useAppStore(s => s.chapters.hydrated)

  const chapterOrder = useMemo(() => {
    const map = new Map<string, number>()
    chapters.forEach((chapter, index) => map.set(chapter.id, index + 1))
    return map
  }, [chapters])

  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return chapters
    return chapters.filter(chapter => chapter.title.toLowerCase().includes(q))
  }, [chapters, searchQuery])

  const selectedIds = useMemo(
    () => new Set(selectedChapters.map(c => c.id)),
    [selectedChapters],
  )

  const toggleChapter = (chapter: Chapter) => {
    if (selectedIds.has(chapter.id)) {
      onSelectionChange(selectedChapters.filter(c => c.id !== chapter.id))
    } else {
      onSelectionChange([...selectedChapters, chapter])
    }
  }

  const close = () => {
    setOpen(false)
    setSearchQuery('')
  }

  const showSearch = chapters.length > 6

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          setOpen(v => !v)
        }}
        className={cn(
          'flex h-8 items-center gap-1 px-2 text-xs bg-background hover:bg-accent rounded-md transition-colors border border-border/80',
          open && 'bg-accent',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        title={t('editor.rightPanel.referenceChapter')}
      >
        <AtSign className="w-3 h-3 text-muted-foreground" />
        {selectedChapters.length > 0 && (
          <span className="text-foreground tabular-nums">{selectedChapters.length}</span>
        )}
        <ChevronDown
          className={cn(
            'w-2.5 h-2.5 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div
            className="absolute bottom-full left-0 z-20 mb-1 w-56 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
            onMouseDown={e => e.preventDefault()}
          >
            {showSearch && (
              <div className="px-2.5 py-2 border-b border-border/60">
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('editor.rightPanel.chapterSelector.searchPlaceholder')}
                  className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            )}

            <div className="max-h-52 overflow-y-auto py-1">
              {!hydrated
                ? (
                    <div className="px-2.5 py-4 text-center text-xs text-muted-foreground">
                      …
                    </div>
                  )
                : filteredChapters.length === 0
                  ? (
                      <div className="px-2.5 py-4 text-center text-xs text-muted-foreground">
                        {searchQuery
                          ? t('editor.rightPanel.chapterSelector.noResults')
                          : t('editor.rightPanel.chapterSelector.empty')}
                      </div>
                    )
                  : (
                      filteredChapters.map((chapter) => {
                        const isSelected = selectedIds.has(chapter.id)
                        const order = chapterOrder.get(chapter.id) ?? 0
                        return (
                          <button
                            key={chapter.id}
                            type="button"
                            draggable
                            onDragStart={(e) => {
                              setChapterAttachmentDragData(e.dataTransfer, {
                                id: chapter.id,
                                title: chapter.title,
                              })
                            }}
                            onClick={() => toggleChapter(chapter)}
                            className={cn(
                              'w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-xs transition-colors cursor-grab active:cursor-grabbing',
                              isSelected
                                ? 'bg-accent text-foreground'
                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                            )}
                          >
                            <span className="w-4 shrink-0 text-[10px] tabular-nums text-muted-foreground/70">
                              {order || '·'}
                            </span>
                            <span className="flex-1 truncate">{chapter.title}</span>
                            {isSelected && (
                              <Check className="w-3 h-3 shrink-0 text-foreground/70" strokeWidth={2.5} />
                            )}
                          </button>
                        )
                      })
                    )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
