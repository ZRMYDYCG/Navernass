'use client'

import type { UIMessagePart } from 'ai'
import { Wrench } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface ToolPartFallbackProps {
  part: any
}

/**
 * 兜底：未识别的 tool part 用一个轻量卡片呈现。
 */
export function ToolPartFallback({ part }: ToolPartFallbackProps) {
  const { t } = useI18n()
  const toolName: string = (part?.type || '').replace(/^tool-/, '') || 'unknown'
  const state: string = part?.state || 'unknown'

  return (
    <div className="my-1.5 rounded-md border border-dashed border-border bg-muted/30 px-2.5 py-2 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Wrench className="w-3 h-3 shrink-0" />
        <span className="font-medium text-foreground">{toolName}</span>
        <span className="ml-auto text-[10px]">{state}</span>
      </div>
    </div>
  )
}

export type { UIMessagePart }
export { cn }
