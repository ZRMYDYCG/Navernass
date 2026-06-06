'use client'

import type { OutlineRefPartData } from '@/lib/editor/composer-message'
import { ListTree } from 'lucide-react'
import { memo } from 'react'
import { cn } from '@/lib/utils'

interface OutlineRefPartProps {
  data: OutlineRefPartData
}

function OutlineRefPartInner({ data }: OutlineRefPartProps) {
  return (
    <span
      className={cn(
        'mx-0.5 inline-flex max-w-[200px] align-middle items-center gap-0.5 rounded-md border border-chart-4/30',
        'bg-chart-4/10 px-1.5 py-0.5 text-xs font-medium text-foreground',
      )}
      title={data.title}
    >
      <ListTree className="size-3 shrink-0 text-chart-4" aria-hidden />
      <span className="truncate">{data.title}</span>
    </span>
  )
}

export const OutlineRefPart = memo(OutlineRefPartInner)
