'use client'

import type { CharacterRefPartData } from '@/lib/editor/composer-message'
import { User } from 'lucide-react'
import { memo } from 'react'
import { cn } from '@/lib/utils'

interface CharacterRefPartProps {
  data: CharacterRefPartData
}

function CharacterRefPartInner({ data }: CharacterRefPartProps) {
  return (
    <span
      className={cn(
        'mx-0.5 inline-flex max-w-[200px] align-middle items-center gap-0.5 rounded-md border border-chart-2/30',
        'bg-chart-2/10 px-1.5 py-0.5 text-xs font-medium text-foreground',
      )}
      title={data.name}
    >
      <User className="size-3 shrink-0 text-chart-2" aria-hidden />
      <span className="truncate">{data.name}</span>
    </span>
  )
}

export const CharacterRefPart = memo(CharacterRefPartInner)
