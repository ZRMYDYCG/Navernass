import { BookOpen, FileText, Hash } from 'lucide-react'
import { PaperCard } from '@/components/ui/paper-card'

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
    <PaperCard className="p-2 space-y-1.5">
      <h3 className="text-xs font-medium text-stone-600 dark:text-stone-300 px-1 font-serif">
        统计信息
      </h3>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-stone-100/50 dark:bg-zinc-700/30 border border-stone-200/60 dark:border-zinc-600/50 col-span-2">
          <BookOpen className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
          <div className="flex-1 min-w-0 flex justify-between items-center">
            <div className="text-[10px] text-stone-500 dark:text-stone-400">总字数</div>
            <div className="text-xs font-medium text-stone-800 dark:text-stone-200 font-mono">
              {formatWordCount(totalWords)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-stone-100/50 dark:bg-zinc-700/30 border border-stone-200/60 dark:border-zinc-600/50">
          <FileText className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight mb-0.5">章节数</div>
            <div className="text-xs font-medium text-stone-800 dark:text-stone-200 leading-tight">
              {totalChapters}
              <span className="text-[10px] text-stone-400 font-normal ml-0.5">章</span>
            </div>
          </div>
        </div>

        {totalVolumes > 0 && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-stone-100/50 dark:bg-zinc-700/30 border border-stone-200/60 dark:border-zinc-600/50">
            <Hash className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight mb-0.5">卷数</div>
              <div className="text-xs font-medium text-stone-800 dark:text-stone-200 leading-tight">
                {totalVolumes}
                <span className="text-[10px] text-stone-400 font-normal ml-0.5">卷</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PaperCard>
  )
}
