import type { Novel } from '@/lib/supabase/sdk'
import * as Popover from '@radix-ui/react-popover'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Edit2, MoreHorizontal, Play, Trash2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface NovelTableProps {
  novels: Novel[]
  loading: boolean
  onOpenNovel: (novel: Novel) => void
  onEditNovel: (novel: Novel) => void
  onDeleteNovel: (novel: Novel) => void
  onContextMenu: (e: React.MouseEvent, novel: Novel) => void
}

export function NovelTable({
  novels,
  loading,
  onOpenNovel,
  onEditNovel,
  onDeleteNovel,
  onContextMenu,
}: NovelTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="w-6 h-6 text-stone-400" />
        <span className="text-sm text-stone-400 font-serif">Loading...</span>
      </div>
    )
  }

  if (novels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400 dark:text-zinc-500 font-serif">
        <p className="text-lg mb-2 italic">Empty pages...</p>
        <p className="text-sm opacity-70">Start writing your first story.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 max-w-5xl mx-auto">
      {novels.map(novel => (
        <div
          key={novel.id}
          onClick={() => onOpenNovel(novel)}
          onContextMenu={e => onContextMenu(e, novel)}
          className="group relative flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer"
        >
          {/* Left: Title & Intro */}
          <div className="flex flex-col gap-1.5 max-w-[50%]">
            <div className="flex items-center gap-3">
              <h3 className="font-serif text-lg font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                {novel.title}
              </h3>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  novel.status === 'published'
                    ? 'border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-500'
                    : 'border-stone-200 text-stone-500 dark:border-zinc-700 dark:text-zinc-500'
                }`}
              >
                {novel.status === 'published' ? 'PUB' : 'DFT'}
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 font-light">
              {novel.description || 'No description'}
            </p>
          </div>

          {/* Right: Metadata */}
          <div className="flex items-center gap-6 text-sm text-zinc-400 dark:text-zinc-500 font-light">
            {/* Tags */}
            <div className="hidden sm:flex gap-2">
              {novel.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs text-zinc-500 bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 min-w-[200px] justify-end">
              <span className="tabular-nums tracking-wide">
                {(novel.word_count || 0).toLocaleString()}
                {' '}
                words
              </span>
              <span className="w-px h-3 bg-stone-300 dark:bg-zinc-700" />
              <span className="whitespace-nowrap">
                {formatDistanceToNow(new Date(novel.updated_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={e => e.stopPropagation()}>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full text-stone-500 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-stone-100 dark:border-zinc-800 p-1 z-50 min-w-[160px] animate-in fade-in zoom-in-95 duration-200"
                    sideOffset={5}
                    align="end"
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); onOpenNovel(novel)
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 rounded-md transition-colors text-left"
                      >
                        <Play className="w-4 h-4 opacity-70" />
                        {' '}
                        Open
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); onEditNovel(novel)
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 rounded-md transition-colors text-left"
                      >
                        <Edit2 className="w-4 h-4 opacity-70" />
                        {' '}
                        Edit Info
                      </button>
                      <div className="h-px bg-stone-100 dark:bg-zinc-800 my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); onDeleteNovel(novel)
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-left"
                      >
                        <Trash2 className="w-4 h-4 opacity-70" />
                        {' '}
                        Delete
                      </button>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
