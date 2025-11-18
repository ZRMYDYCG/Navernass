/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import type { Chapter } from '@/lib/supabase/sdk'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SelectedChaptersProps {
  chapters: Chapter[]
  onRemove: (chapterId: string) => void
}

export function SelectedChapters({ chapters, onRemove }: SelectedChaptersProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const checkScrollability = () => {
      const container = scrollContainerRef.current
      if (!container) return

      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1,
      )
    }

    checkScrollability()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollability)
      window.addEventListener('resize', checkScrollability)
      return () => {
        container.removeEventListener('scroll', checkScrollability)
        window.removeEventListener('resize', checkScrollability)
      }
    }
  }, [chapters])

  // 滚动函数
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 200
    const targetScroll
      = direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })
  }

  if (chapters.length === 0) return null

  return (
    <div className="relative flex items-center gap-1">
      {/* 左滚动按钮 */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 p-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
          title="向左滚动"
        >
          <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {chapters.map(chapter => (
          <div
            key={chapter.id}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded shrink-0 transition-all duration-200 hover:scale-105 animate-in fade-in-0 slide-in-from-left-1"
          >
            <span
              className="text-[10px] text-gray-700 dark:text-gray-300 truncate max-w-[50px]"
              title={chapter.title}
            >
              {chapter.title.length > 4 ? `${chapter.title.slice(0, 4)}...` : chapter.title}
            </span>
            <button
              type="button"
              onClick={() => onRemove(chapter.id)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all duration-150 shrink-0 hover:scale-110 active:scale-95"
              title="移除"
            >
              <X className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        ))}
      </div>

      {/* 右滚动按钮 */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 p-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
          title="向右滚动"
        >
          <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      <style jsx>
        {`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}
      </style>
    </div>
  )
}
