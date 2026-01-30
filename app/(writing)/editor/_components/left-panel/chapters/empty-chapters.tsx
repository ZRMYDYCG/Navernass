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
        <div className="mx-auto mb-3 flex items-center justify-center text-muted-foreground">
          <BookOpen className="h-6 w-6" />
        </div>

        <h3 className="text-sm font-medium text-foreground">
          还没有章节
        </h3>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          开始你的创作之旅，创建你的第一个章节或卷
        </p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={onCreateChapter}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-foreground hover:text-foreground/90 rounded-md border border-border bg-background hover:bg-accent transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            新建章节
          </button>
          <button
            onClick={onCreateVolume}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md border border-border/60 bg-background hover:bg-accent transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            新建卷
          </button>
        </div>
      </div>
    </div>
  )
}
