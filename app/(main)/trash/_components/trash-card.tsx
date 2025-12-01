import type { Novel } from '@/lib/supabase/sdk'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { BookOpen, Check } from 'lucide-react'
import { PaperCard } from '@/components/ui/paper-card'
import { cn } from '@/lib/utils'

interface TrashCardProps {
  novel: Novel
  selected: boolean
  onToggleSelect: (novel: Novel) => void
  onContextMenu: (e: React.MouseEvent, novel: Novel) => void
}

export function TrashCard({ novel, selected, onToggleSelect, onContextMenu }: TrashCardProps) {
  return (
    <PaperCard
      variant="default"
      className={cn(
        "group aspect-3/4 cursor-pointer transition-all duration-200",
        selected && "ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 dark:ring-offset-zinc-900"
      )}
      onClick={() => onToggleSelect(novel)}
      onContextMenu={e => onContextMenu(e, novel)}
    >
      {/* 选择指示器 */}
      <div
        className={cn(
          "absolute top-3 right-3 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-sm",
          selected
            ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100"
            : "bg-white/80 dark:bg-zinc-800/80 border-stone-300 dark:border-zinc-600 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        )}
      >
        <Check className={cn("w-3.5 h-3.5", selected ? "text-white dark:text-zinc-900" : "text-stone-400")} />
      </div>

      {/* 上半部分：封面/图标 */}
      <div className="h-[45%] w-full bg-stone-50/50 dark:bg-zinc-800/50 relative p-5 flex flex-col justify-between border-b border-stone-100 dark:border-zinc-700/50">
        <div className="flex items-start justify-between opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded border border-stone-300 text-stone-500 dark:border-zinc-600 dark:text-zinc-400">
            已删除
          </span>
          {novel.category && (
             <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-serif italic">
              {novel.category}
            </span>
          )}
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

      {/* 下半部分：信息 */}
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
          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-600 font-medium tracking-wide border-t border-stone-50 dark:border-zinc-800 pt-3">
            <div className="flex gap-2">
               <span>{(novel.word_count / 1000).toFixed(1)}k 字</span>
               <span>•</span>
               <span>{novel.chapter_count} 章节</span>
            </div>
            <span>
              归档于 {formatDistanceToNow(new Date(novel.updated_at), { locale: zhCN, addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </PaperCard>
  )
}
