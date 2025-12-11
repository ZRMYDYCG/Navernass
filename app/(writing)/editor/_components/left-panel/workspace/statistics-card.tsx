import { BookOpen, FileText, Hash } from 'lucide-react'

interface StatisticsCardProps {
  totalWords: number
  totalChapters: number
  totalVolumes: number
}

export function StatisticsCard({ totalWords, totalChapters, totalVolumes }: StatisticsCardProps) {
  const formatWordCount = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万字`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k字`
    }
    return `${count}字`
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-stone-600 dark:text-stone-300 px-1 font-serif">
        统计信息
      </span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-stone-100/50 dark:bg-zinc-700/30 border border-stone-200/60 dark:border-zinc-600/50">
          <BookOpen className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            {formatWordCount(totalWords)}
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-stone-100/50 dark:bg-zinc-700/30 border border-stone-200/60 dark:border-zinc-600/50">
          <FileText className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            {totalChapters}章
          </div>
        </div>
        {totalVolumes > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-stone-100/50 dark:bg-zinc-700/30 border border-stone-200/60 dark:border-zinc-600/50">
            <Hash className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
            <div className="text-[10px] text-stone-500 dark:text-stone-400">
              {totalVolumes}卷
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
