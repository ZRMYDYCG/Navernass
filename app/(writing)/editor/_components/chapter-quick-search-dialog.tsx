"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { useEffect, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setActiveIndex(0)
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onOpenChange])

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return chapters
    }
    const lower = query.toLowerCase()
    return chapters.filter(item => item.title.toLowerCase().includes(lower))
  }, [chapters, query])

  useEffect(() => {
    if (!open) return
    if (filtered.length === 0) {
      setActiveIndex(0)
      return
    }
    const currentIndex = filtered.findIndex(item => item.id === currentChapterId)
    if (currentIndex >= 0) {
      setActiveIndex(currentIndex)
    } else {
      setActiveIndex(0)
    }
  }, [open, filtered, currentChapterId])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex(prev => (prev + 1) % filtered.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex(prev => (prev - 1 + filtered.length) % filtered.length)
    } else if (event.key === "Enter") {
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-24 z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-zinc-700">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              autoFocus
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-zinc-50"
              placeholder="搜索章节标题"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-zinc-400">暂无匹配章节</div>
            ) : (
              <ul className="py-1">
                {filtered.map((item, index) => {
                  const isActive = index === activeIndex
                  const isCurrent = item.id === currentChapterId
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(item.id)}
                        className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary dark:bg-primary/20"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        {isCurrent && (
                          <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
