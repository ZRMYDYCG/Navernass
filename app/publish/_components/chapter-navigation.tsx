'use client'

import { ChevronLeft, ChevronRight, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { PublishedChapter } from '../types'

interface ChapterNavigationProps {
  chapters: PublishedChapter[]
  currentChapterIndex: number
  onChapterChange: (index: number) => void
}

export function ChapterNavigation({
  chapters,
  currentChapterIndex,
  onChapterChange,
}: ChapterNavigationProps) {
  const hasPrevious = currentChapterIndex > 0
  const hasNext = currentChapterIndex < chapters.length - 1
  const currentChapter = chapters[currentChapterIndex]

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
            <ScrollArea className="h-96">
              {chapters.map((chapter, index) => (
                <DropdownMenuItem
                  key={chapter.id}
                  onClick={() => onChapterChange(index)}
                  className={index === currentChapterIndex ? 'bg-accent' : ''}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="font-medium truncate">{chapter.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {chapter.word_count} 字
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
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
