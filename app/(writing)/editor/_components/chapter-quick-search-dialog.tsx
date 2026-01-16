'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface ChapterQuickSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapters: Array<{
    id: string
    title: string
  }>
  currentChapterId: string | null
  onSelectChapter: (chapterId: string) => void
}

export function ChapterQuickSearchDialog({
  open,
  onOpenChange,
  chapters,
  currentChapterId,
  onSelectChapter,
}: ChapterQuickSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return chapters
    }
    const lower = query.toLowerCase()
    return chapters.filter(item => item.title.toLowerCase().includes(lower))
  }, [chapters, query])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onOpenChange])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setQuery('')
      setActiveIndex(0)
    }
    onOpenChange(newOpen)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(prev => (prev + 1) % filtered.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(prev => (prev - 1 + filtered.length) % filtered.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const target = filtered[activeIndex]
      if (target) {
        onSelectChapter(target.id)
        onOpenChange(false)
      }
    }
  }

  const handleItemClick = (id: string) => {
    onSelectChapter(id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[20%] translate-y-0 max-w-xl p-0 gap-0 overflow-hidden shadow-2xl"
      >
        <DialogTitle className="sr-only">搜索章节</DialogTitle>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none h-6"
            placeholder="搜索章节标题..."
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-1">
          {filtered.length === 0
            ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">暂无匹配章节</div>
              )
            : (
                <ul className="py-1 px-1">
                  {filtered.map((item, index) => {
                    const isActive = index === activeIndex
                    const isCurrent = item.id === currentChapterId
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleItemClick(item.id)}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-all rounded-sm ${
                            isActive
                              ? 'bg-accent text-accent-foreground'
                              : 'text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <span className="truncate">{item.title}</span>
                          {isCurrent && (
                            <span className="ml-2 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              当前
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
