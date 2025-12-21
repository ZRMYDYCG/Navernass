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
      <span className="text-xs font-medium text-foreground px-1 font-serif">
        统计信息
      </span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50 border border-border/60">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <div className="text-[10px] text-muted-foreground">
            {formatWordCount(totalWords)}
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50 border border-border/60">
          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <div className="text-[10px] text-muted-foreground">
            {totalChapters}章
          </div>
        </div>
        {totalVolumes > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50 border border-border/60">
            <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div className="text-[10px] text-muted-foreground">
              {totalVolumes}卷
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
