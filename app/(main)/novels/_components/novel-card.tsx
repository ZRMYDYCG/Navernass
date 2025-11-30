import type { Novel } from '@/lib/supabase/sdk'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface NovelCardProps {
  novel: Novel
  onOpen: (novel: Novel) => void
  onContextMenu: (e: React.MouseEvent, novel: Novel) => void
}

export function NovelCard({ novel, onOpen, onContextMenu }: NovelCardProps) {
  return (
    <div
      className="group relative aspect-[3/4] bg-white dark:bg-zinc-800 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:translate-y-0 active:shadow-sm transition-all duration-300 ease-out cursor-pointer overflow-hidden border border-stone-100 dark:border-zinc-700/50"
      onClick={() => onOpen(novel)}
      onContextMenu={e => onContextMenu(e, novel)}
    >
      {/* Paper Texture / Header Area */}
      <div className="h-[45%] w-full bg-stone-50 dark:bg-zinc-800/80 relative p-5 flex flex-col justify-between border-b border-stone-100 dark:border-zinc-700/50">
        {/* Status Badge */}
        <div className="flex items-start justify-between opacity-60 group-hover:opacity-100 transition-opacity">
           <span
            className={`text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded border ${
              novel.status === 'published'
                ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
                : 'border-stone-300 text-stone-500 dark:border-zinc-600 dark:text-zinc-400'
            }`}
          >
            {novel.status === 'published' ? 'Published' : 'Draft'}
          </span>
          {novel.category && (
             <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-serif italic">
              {novel.category}
            </span>
          )}
        </div>
        
        {/* Decorative elements imitating paper texture/lines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col h-[55%] justify-between bg-white dark:bg-zinc-900">
        <div className="space-y-3">
          <h3 className="font-serif text-xl font-medium text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
            {novel.title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3 font-light">
            {novel.description || '暂无简介...'}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {/* Tags */}
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

          {/* Footer Info */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-600 font-medium tracking-wide border-t border-stone-50 dark:border-zinc-800 pt-3">
            <div className="flex gap-2">
               <span>{(novel.word_count / 1000).toFixed(1)}k 字</span>
            </div>
            <span>
              {formatDistanceToNow(new Date(novel.updated_at), { locale: zhCN, addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
