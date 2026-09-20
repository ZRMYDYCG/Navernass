'use client'

import type { ChapterRefPartData } from '@/lib/editor/composer-message'
import { FileText } from 'lucide-react'
import { memo } from 'react'
import { cn } from '@/lib/utils'

interface ChapterRefPartProps {
  data: ChapterRefPartData
}

function ChapterRefPartInner({ data }: ChapterRefPartProps) {
  return (
    <span
      className={cn(
        'mx-0.5 inline-flex max-w-[200px] align-middle items-center gap-0.5 rounded-md border border-border/80',
        'bg-muted/70 px-1.5 py-0.5 text-xs font-medium text-foreground',
      )}
      title={data.title}
    >
      <FileText className="size-3 shrink-0 text-primary/80" aria-hidden />
      <span className="truncate">{data.title}</span>
    </span>
  )
}

export const ChapterRefPart = memo(ChapterRefPartInner)
