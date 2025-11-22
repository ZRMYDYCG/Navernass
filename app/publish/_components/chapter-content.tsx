'use client'

import type { PublishedChapter } from '../types'
import { FONT_SIZE_MAP } from '../types'

interface ChapterContentProps {
  chapter: PublishedChapter
  fontSize: keyof typeof FONT_SIZE_MAP
}

export function ChapterContent({ chapter, fontSize }: ChapterContentProps) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-4 border-b">
        <span>{chapter.word_count} 字</span>
        <span>
          {new Date(chapter.updated_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      <div
        className="max-w-none leading-relaxed text-foreground [&_p]:mb-6 [&_h1]:font-semibold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_strong]:font-semibold [&_em]:italic"
        style={{
          fontSize: FONT_SIZE_MAP[fontSize],
        }}
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />
    </article>
  )
}
