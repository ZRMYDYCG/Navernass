'use client'

import { BookOpen, FolderPlus } from 'lucide-react'

interface EmptyChaptersProps {
  onCreateChapter?: () => void
  onCreateVolume?: () => void
}

export function EmptyChapters({ onCreateChapter, onCreateVolume }: EmptyChaptersProps) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>

        <h3 className="text-sm font-medium text-foreground mb-2">
          还没有章节
        </h3>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          开始你的创作之旅，创建你的第一个章节或卷
        </p>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onCreateChapter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            新建章节
          </button>
          <button
            onClick={onCreateVolume}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            新建卷
          </button>
        </div>
      </div>
    </div>
  )
}