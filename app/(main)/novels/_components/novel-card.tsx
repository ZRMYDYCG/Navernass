import type { Novel } from '@/lib/supabase/sdk'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { BookOpen, EllipsisVertical, GripHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

function noop() {}

interface NovelCardProps {
  novel: Novel
  onOpen: (novel: Novel) => void
  onContextMenu?: (e: React.MouseEvent, novel: Novel) => void
  dragListeners?: unknown
}

export function NovelCard({
  novel,
  onOpen,
  onContextMenu = noop,
  dragListeners,
}: NovelCardProps) {
  const [isMenuActive, setIsMenuActive] = useState(false)
  const handleContextMenu = (e: React.MouseEvent, novel: Novel) => {
    setIsMenuActive(true)
    onContextMenu(e, novel)
  }
  useEffect(() => {
    if (isMenuActive) {
      const handleGlobalClick = (event: MouseEvent) => {
        // eslint-disable-next-line react-web-api/no-leaked-timeout
        setTimeout(() => {
          const contextMenu = document.querySelector('[data-type="novel-context-menu"]')
          const isClickInsideMenu = contextMenu?.contains(event.target as Node)
          const isClickOnButton = event.target === document.activeElement?.closest('.ml-auto')

          if (!isClickInsideMenu && !isClickOnButton) {
            setIsMenuActive(false)
          }
        }, 0)
      }

      document.addEventListener('click', handleGlobalClick)

      return () => {
        document.removeEventListener('click', handleGlobalClick)
      }
    }
  }, [isMenuActive])
  return (
    <div
      className={cn(
        'group aspect-[3/4] sm:aspect-3/4',
        'relative bg-card rounded-xl border border-border',
        'shadow-sm transition-all duration-300 overflow-hidden cursor-pointer',
        {
          'hover:shadow-md hover:-translate-y-1': !isMenuActive,
          'shadow-md -translate-y-1': isMenuActive,
        },
      )}
      onClick={() => onOpen(novel)}
    >
      <div className="relative z-10 h-full">
        <div className="h-[45%] w-full bg-secondary relative p-5 flex flex-col justify-between border-b border-border">
        <div className={cn(
          'flex items-center justify-between opacity-60 transition-opacity',
          {
            'opacity-100': isMenuActive,
            'group-hover:opacity-100': !isMenuActive,
          },
        )}
        >
          <span
            className={cn(
              'text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded-sm border',
              novel.status === 'published'
                ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
                : 'border-border text-muted-foreground',
            )}
          >
            {novel.status === 'published' ? '已发布' : '草稿'}
          </span>
          {novel.category && (
            <span className="text-[10px] text-muted-foreground font-serif italic">
              {novel.category}
            </span>
          )}
          <div
            className={cn(
              'ml-auto opacity-0 rounded-sm transition-opacity p-1.5 text-muted-foreground cursor-pointer',
              {
                'opacity-100 bg-accent': isMenuActive,
                'group-hover:opacity-100 hover:bg-accent': !isMenuActive,
              },
            )}
            // 这里需要触发上下文菜单
            onClick={(e) => {
              e.stopPropagation()
              const targetElement = e.currentTarget
              const rect = targetElement.getBoundingClientRect()
              const mockEvent = {
                clientX: rect.left - 134,
                clientY: rect.bottom + 3,
                preventDefault: () => { },
              } as React.MouseEvent
              handleContextMenu(mockEvent, novel)
            }}
          >
            <EllipsisVertical className="w-3 h-3 text-muted-foreground" />
          </div>
          <div
            className={cn(
              'absolute left-1/2 top-1 items-center justify-center transition-opacity cursor-move -translate-x-1/2',
              {
                'flex': isMenuActive,
                'hidden group-hover:flex': !isMenuActive,
              },
            )}
            {...(typeof dragListeners === 'object' ? dragListeners : {})}
          >
            <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-3 relative w-full flex-1 rounded-md overflow-hidden bg-secondary flex items-center justify-center">
          {novel.cover
            ? (
                <img
                  src={novel.cover}
                  alt={novel.title}
                  className="w-full h-full object-cover"
                />
              )
            : (
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              )}
        </div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px]" />
      </div>

      <div className="p-5 flex flex-col h-[55%] justify-between bg-background backdrop-blur-sm">
        <div className="space-y-3">
          <h3
            className={cn(
              'font-serif text-lg sm:text-xl font-medium text-foreground leading-tight transition-colors',
              {
                'opacity-70': isMenuActive,
                'group-hover:opacity-70': !isMenuActive,
              },
            )}
          >
            {novel.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-light">
            {novel.description || '暂无简介...'}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {novel.tags && novel.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {novel.tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border rounded bg-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium tracking-wide border-t border-border pt-3">
            <div className="flex gap-2">
              <span>
                {(novel.word_count / 1000).toFixed(1)}
                k 字
              </span>
            </div>
            <span>
              {formatDistanceToNow(new Date(novel.updated_at), { locale: zhCN, addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
