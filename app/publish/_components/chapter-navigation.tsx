'use client'

import { useMemo, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PublishedChapter, PublishedVolume } from '../types'

interface ChapterNavigationProps {
  volumes: PublishedVolume[]
  chapters: PublishedChapter[]
  currentChapterIndex: number
  onChapterChange: (index: number) => void
}

export function ChapterNavigation({
  volumes,
  chapters,
  currentChapterIndex,
  onChapterChange,
}: ChapterNavigationProps) {
  const hasPrevious = currentChapterIndex > 0
  const hasNext = currentChapterIndex < chapters.length - 1
  const currentChapter = chapters[currentChapterIndex]

  const [scrollTop, setScrollTop] = useState(0)
  const itemHeight = 40
  const visibleCount = 20

  const items = useMemo(() => {
    const result: Array<
      | { type: 'volume', id: string, title: string }
      | { type: 'chapter', id: string, title: string, wordCount: number, originalIndex: number }
    > = []

    const chaptersByVolume: Record<string, PublishedChapter[]> = {}
    const chaptersWithoutVolume: PublishedChapter[] = []

    chapters.forEach((chapter, index) => {
      if (chapter.volume_id) {
        if (!chaptersByVolume[chapter.volume_id]) {
          chaptersByVolume[chapter.volume_id] = []
        }
        chaptersByVolume[chapter.volume_id].push({ ...chapter, order_index: chapter.order_index ?? index })
      } else {
        chaptersWithoutVolume.push({ ...chapter, order_index: chapter.order_index ?? index })
      }
    })

    const sortedVolumes = [...volumes].sort((a, b) => a.order_index - b.order_index)

    sortedVolumes.forEach(volume => {
      const volumeChapters = (chaptersByVolume[volume.id] || []).sort(
        (a, b) => a.order_index - b.order_index,
      )
      if (volumeChapters.length === 0) {
        return
      }
      result.push({ type: 'volume', id: volume.id, title: volume.title })
      volumeChapters.forEach(chapter => {
        const originalIndex = chapters.findIndex(c => c.id === chapter.id)
        if (originalIndex !== -1) {
          result.push({
            type: 'chapter',
            id: chapter.id,
            title: chapter.title,
            wordCount: chapter.word_count,
            originalIndex,
          })
        }
      })
    })

    const sortedWithoutVolume = chaptersWithoutVolume.sort((a, b) => a.order_index - b.order_index)
    sortedWithoutVolume.forEach(chapter => {
      const originalIndex = chapters.findIndex(c => c.id === chapter.id)
      if (originalIndex !== -1) {
        result.push({
          type: 'chapter',
          id: chapter.id,
          title: chapter.title,
          wordCount: chapter.word_count,
          originalIndex,
        })
      }
    })

    return result
  }, [chapters, volumes])

  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight))
  const endIndex = Math.min(items.length, startIndex + visibleCount)
  const offsetTop = startIndex * itemHeight
  const offsetBottom = Math.max(0, totalHeight - offsetTop - (endIndex - startIndex) * itemHeight)

  const visibleItems = items.slice(startIndex, endIndex)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between border-t border-b py-4">
        <Button
          variant="ghost"
          onClick={() => onChapterChange(currentChapterIndex - 1)}
          disabled={!hasPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          上一章
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              目录 ({currentChapterIndex + 1}/{chapters.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-80">
            <div className="h-96 overflow-y-auto" onScroll={handleScroll}>
              <div style={{ height: totalHeight }}>
                <div style={{ paddingTop: offsetTop, paddingBottom: offsetBottom }}>
                  {visibleItems.map((item, index) => {
                    if (item.type === 'volume') {
                      return (
                        <div
                          key={item.id}
                          className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/60"
                        >
                          {item.title}
                        </div>
                      )
                    }

                    const isActive = item.originalIndex === currentChapterIndex

                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => onChapterChange(item.originalIndex)}
                        className={isActive ? 'bg-accent' : ''}
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.wordCount} 字
                          </div>
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          onClick={() => onChapterChange(currentChapterIndex + 1)}
          disabled={!hasNext}
          className="flex items-center gap-2"
        >
          下一章
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
