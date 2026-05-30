'use client'

import type { ReasoningUIPart } from 'ai'
import { Sparkles } from 'lucide-react'
import { memo, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { AguiExpandableContent, AguiExpandChevron } from './agui-expandable'
import { StreamCaret } from './stream-caret'

interface ReasoningPartProps {
  part: ReasoningUIPart
  /** 该 part 是否仍在流式产出中 */
  isStreaming?: boolean
}

/**
 * AG-UI 风格 reasoning part：默认展开，轻度终端样式。
 */
function ReasoningPartInner({ part, isStreaming }: ReasoningPartProps) {
  const { t } = useI18n()
  const text = part.text || ''
  const partState = part.state ?? (isStreaming ? 'streaming' : 'done')
  const isLive = isStreaming || partState === 'streaming'
  const [isExpanded, setIsExpanded] = useState(true)

  if (!text && !isLive) return null

  return (
    <div
      data-live={isLive ? 'true' : 'false'}
      className={cn(
        'agui-thinking-panel my-1 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-1 duration-200',
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <Sparkles className={cn('w-3 h-3 shrink-0', isLive && 'text-primary animate-pulse')} />
          <span className="font-medium truncate">{t('editor.rightPanel.deepThinking')}</span>
          {isLive && (
            <span className="inline-flex items-center gap-0.5 ml-1 shrink-0">
              <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
              <span className="w-1 h-1 bg-primary rounded-full animate-pulse [animation-delay:120ms]" />
              <span className="w-1 h-1 bg-primary rounded-full animate-pulse [animation-delay:240ms]" />
            </span>
          )}
        </span>
        <AguiExpandChevron open={isExpanded} />
      </button>

      <AguiExpandableContent open={isExpanded}>
        <div className="agui-thinking-body px-2.5 py-2 text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed border-t border-border/40">
          {text}
          {isLive && <StreamCaret />}
        </div>
      </AguiExpandableContent>
    </div>
  )
}

export const ReasoningPart = memo(ReasoningPartInner)
