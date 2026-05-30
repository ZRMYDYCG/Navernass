'use client'

import type { ReasoningUIPart } from 'ai'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'

interface ReasoningPartProps {
  part: ReasoningUIPart
  /** 该 part 是否仍在流式产出中 */
  isStreaming?: boolean
}

/**
 * AG-UI 风格 reasoning part 渲染器。
 * 流式过程中默认展开以体现"思考"过程，结束后默认折叠。
 */
function ReasoningPartInner({ part, isStreaming }: ReasoningPartProps) {
  const { t } = useI18n()
  const text = part.text || ''
  const partState = part.state ?? (isStreaming ? 'streaming' : 'done')
  const isLive = isStreaming || partState === 'streaming'
  const [isExpanded, setIsExpanded] = useState(true)
  const [autoCollapsed, setAutoCollapsed] = useState(false)

  useEffect(() => {
    if (!isLive && !autoCollapsed) {
      setIsExpanded(false)
      setAutoCollapsed(true)
    }
  }, [isLive, autoCollapsed])

  if (!text && !isLive) return null

  return (
    <div className="my-1 rounded-md border border-border/60 bg-muted/40 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className={`w-3 h-3 ${isLive ? 'text-primary animate-pulse' : ''}`} />
          <span className="font-medium">{t('editor.rightPanel.deepThinking')}</span>
          {isLive && (
            <span className="inline-flex items-center gap-0.5 ml-1">
              <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
              <span className="w-1 h-1 bg-primary rounded-full animate-pulse [animation-delay:120ms]" />
              <span className="w-1 h-1 bg-primary rounded-full animate-pulse [animation-delay:240ms]" />
            </span>
          )}
        </span>
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isExpanded && (
        <div className="px-2.5 py-2 text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed border-t border-border/40 bg-background/40">
          {text}
          {isLive && <span className="inline-block w-1 h-3 ml-0.5 bg-muted-foreground/60 align-middle animate-pulse" />}
        </div>
      )}
    </div>
  )
}

export const ReasoningPart = memo(ReasoningPartInner)
