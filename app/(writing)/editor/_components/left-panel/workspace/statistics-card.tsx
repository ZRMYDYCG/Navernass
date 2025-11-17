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
    <div className="space-y-1.5">
      <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 px-1">
        统计信息
      </h3>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-white dark:bg-zinc-700/50 border border-gray-200 dark:border-gray-600">
          <BookOpen className="w-3 h-3 text-gray-500 dark:text-gray-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">总字数</div>
            <div className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
              {formatWordCount(totalWords)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-white dark:bg-zinc-700/50 border border-gray-200 dark:border-gray-600">
          <FileText className="w-3 h-3 text-gray-500 dark:text-gray-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">章节数</div>
            <div className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
              {totalChapters}
              {' '}
              章
            </div>
          </div>
        </div>

        {totalVolumes > 0 && (
          <div className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-white dark:bg-zinc-700/50 border border-gray-200 dark:border-gray-600">
            <Hash className="w-3 h-3 text-gray-500 dark:text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">卷数</div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
                {totalVolumes}
                {' '}
                卷
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
