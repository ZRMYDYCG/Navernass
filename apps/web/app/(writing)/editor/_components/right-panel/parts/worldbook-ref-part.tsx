'use client'

import type { WorldbookRefPartData } from '@/lib/editor/composer-message'
import { Globe2 } from 'lucide-react'
import { memo } from 'react'
import { cn } from '@/lib/utils'

interface WorldbookRefPartProps {
  data: WorldbookRefPartData
}

function WorldbookRefPartInner({ data }: WorldbookRefPartProps) {
  return (
    <span
      className={cn(
        'mx-0.5 inline-flex max-w-[200px] align-middle items-center gap-0.5 rounded-md border border-chart-3/30',
        'bg-chart-3/10 px-1.5 py-0.5 text-xs font-medium text-foreground',
      )}
      title={data.title}
    >
      <Globe2 className="size-3 shrink-0 text-chart-3" aria-hidden />
      <span className="truncate">{data.title}</span>
    </span>
  )
}

export const WorldbookRefPart = memo(WorldbookRefPartInner)
