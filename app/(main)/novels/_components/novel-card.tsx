import type { Novel } from '@/lib/supabase/sdk'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { BookOpen, GripHorizontal, EllipsisVertical } from 'lucide-react'
import { PaperCard } from '@/components/ui/paper-card'

interface NovelCardProps {
  novel: Novel
  onOpen: (novel: Novel) => void
  onContextMenu: (e: React.MouseEvent, novel: Novel) => void
  dragListeners?: any
}

export function NovelCard({ novel, onOpen, onContextMenu, dragListeners }: NovelCardProps) {
  return (
    <PaperCard
      variant="default"
      className="group aspect-3/4"
      onClick={() => onOpen(novel)}
    >
      <div className="h-[45%] w-full bg-stone-50/50 dark:bg-zinc-800/50 relative p-5 flex flex-col justify-between border-b border-stone-100 dark:border-zinc-700/50">
        <div className="flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
          <span
            className={`text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded border ${novel.status === 'published'
              ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
              : 'border-stone-300 text-stone-500 dark:border-zinc-600 dark:text-zinc-400'
              }`}
          >
            {novel.status === 'published' ? '已发布' : '草稿'}
          </span>
          {novel.category && (
            <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-serif italic">
              {novel.category}
            </span>
          )}
          <div
            className='ml-auto rounded-sm opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-400 dark:border-zinc-500 p-1.5 text-zinc-400 cursor-pointer dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors'
            // 这里需要触发上下文菜单
            onClick={(e) => {
              e.stopPropagation();
              const targetElement = e.currentTarget;
              const rect = targetElement.getBoundingClientRect();
              const mockEvent = {
                clientX: rect.left + rect.width / 2,
                clientY: rect.bottom + 3,           // 底部10px距离
                preventDefault: () => { }
              } as React.MouseEvent;
              onContextMenu(mockEvent, novel);
            }}
          >
            <EllipsisVertical className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div
            className="absolute left-1/2 top-1 hidden group-hover:flex items-center justify-center transition-opacity cursor-move -translate-x-1/2"
            {...dragListeners}
          >
            <GripHorizontal className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          </div>
        </div>
        <div className="mt-3 relative w-full flex-1 rounded-md overflow-hidden bg-stone-100 dark:bg-zinc-700 flex items-center justify-center">
          {novel.cover
            ? (
              <img
                src={novel.cover}
                alt={novel.title}
                className="w-full h-full object-cover"
              />
            )
            : (
              <BookOpen className="w-10 h-10 text-stone-300 dark:text-zinc-500" />
            )}
        </div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px]" />
      </div>

      <div className="p-5 flex flex-col h-[55%] justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="space-y-3">
          <h3 className="font-serif text-xl font-medium text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
            {novel.title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3 font-light">
            {novel.description || '暂无简介...'}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {novel.tags && novel.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {novel.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 text-[10px] text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-800/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-600 font-medium tracking-wide border-t border-stone-50 dark:border-zinc-800 pt-3">
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
    </PaperCard>
  )
}
