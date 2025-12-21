import { Clock, FileText } from 'lucide-react'
import { useMemo } from 'react'

interface Chapter {
  id: string
  title: string
  updated_at?: string
}

interface RecentChaptersProps {
  chapters: Chapter[]
  onSelectChapter?: (chapterId: string) => void
  maxItems?: number
}

export function RecentChapters({
  chapters,
  onSelectChapter,
  maxItems = 5,
}: RecentChaptersProps) {
  const recentChapters = useMemo(() => {
    return [...chapters]
      .sort((a, b) => {
        const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return timeB - timeA
      })
      .slice(0, maxItems)
  }, [chapters, maxItems])

  const formatTime = (dateString?: string) => {
    if (!dateString) return '未知'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  if (recentChapters.length === 0) {
    return (
      <div className="space-y-1.5">
        <h3 className="text-xs font-medium text-foreground px-1 font-serif">
          最近编辑
        </h3>
        <div className="px-1.5 py-4 text-center text-[10px] text-muted-foreground italic">
          暂无最近编辑的章节
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-medium text-foreground px-1 font-serif">
        最近编辑
      </h3>
      <div className="space-y-0.5">
        {recentChapters.map(chapter => (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onSelectChapter?.(chapter.id)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-accent transition-all group"
          >
            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate leading-tight group-hover:text-foreground transition-colors">
                {chapter.title}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground leading-tight mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                {formatTime(chapter.updated_at)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

