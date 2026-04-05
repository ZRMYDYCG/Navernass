'use client'

import { Clock, FileText } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n, useLocale } from '@/hooks/use-i18n'

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
  const { t } = useI18n()
  const { locale } = useLocale()
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
    if (!dateString) return t('editor.leftPanel.workspace.recentChapters.time.unknown')
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return t('editor.leftPanel.workspace.recentChapters.time.justNow')
    if (minutes < 60) return t('editor.leftPanel.workspace.recentChapters.time.minutesAgo', { count: minutes })
    if (hours < 24) return t('editor.leftPanel.workspace.recentChapters.time.hoursAgo', { count: hours })
    if (days < 7) return t('editor.leftPanel.workspace.recentChapters.time.daysAgo', { count: days })
    return date.toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
  }

  if (recentChapters.length === 0) {
    return (
      <div className="space-y-1.5">
        <h3 className="text-xs font-medium text-foreground px-1 font-serif">
          {t('editor.leftPanel.workspace.recentChapters.title')}
        </h3>
        <div className="px-1.5 py-4 text-center text-[10px] text-muted-foreground italic">
          {t('editor.leftPanel.workspace.recentChapters.empty')}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-medium text-foreground px-1 font-serif">
        {t('editor.leftPanel.workspace.recentChapters.title')}
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
