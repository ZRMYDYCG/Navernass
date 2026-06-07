'use client'

import type { BookRefPartData } from '@/lib/editor/composer-message'
import { BookMarked } from 'lucide-react'
import { memo } from 'react'
import { cn } from '@/lib/utils'

interface BookRefPartProps {
  data: BookRefPartData
}

/**
 * 用户消息中的 @book 引用 chip。
 * 视觉与编辑器内联 chip 对齐：amber 边框 + BookMarked 图标。
 */
function BookRefPartInner({ data }: BookRefPartProps) {
  return (
    <span
      className={cn(
        'mx-0.5 inline-flex max-w-[200px] align-middle items-center gap-0.5 rounded-md border border-amber-500/30',
        'bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-foreground',
      )}
      title={data.title}
    >
      <BookMarked className="size-3 shrink-0 text-amber-600" aria-hidden />
      <span className="truncate">{data.title}</span>
    </span>
  )
}

export const BookRefPart = memo(BookRefPartInner)
