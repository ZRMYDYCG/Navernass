'use client'

import type { VolumeRefPartData } from '@/lib/editor/composer-message'
import { BookOpen } from 'lucide-react'
import { memo } from 'react'
import { cn } from '@/lib/utils'

interface VolumeRefPartProps {
  data: VolumeRefPartData
}

function VolumeRefPartInner({ data }: VolumeRefPartProps) {
  return (
    <span
      className={cn(
        'mx-0.5 inline-flex max-w-[200px] align-middle items-center gap-0.5 rounded-md border border-primary/25',
        'bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-foreground',
      )}
      title={data.title}
    >
      <BookOpen className="size-3 shrink-0 text-primary/80" aria-hidden />
      <span className="truncate">{data.title}</span>
    </span>
  )
}

export const VolumeRefPart = memo(VolumeRefPartInner)
