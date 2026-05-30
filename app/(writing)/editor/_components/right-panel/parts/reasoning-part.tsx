'use client'

import type { ReasoningUIPart } from 'ai'
import { Brain } from 'lucide-react'
import { memo, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { AguiExpandableContent, AguiExpandChevron } from './agui-expandable'
import { StreamLoading } from './stream-loading'

interface ReasoningPartProps {
  part: ReasoningUIPart
  /** 该 part 是否仍在流式产出中 */
  isStreaming?: boolean
}

/**
 * AG-UI 风格 reasoning part：默认展开，纯文字下拉样式。
 */
function ReasoningPartInner({ part, isStreaming }: ReasoningPartProps) {
  const { t } = useI18n()
  const text = part.text || ''
  const partState = part.state ?? (isStreaming ? 'streaming' : 'done')
  const isLive = isStreaming || partState === 'streaming'
  const [isExpanded, setIsExpanded] = useState(true)

  if (!text && !isLive) return null

  return (
    <div className="py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
      <div className="w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(v => !v)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Brain className={cn('w-3 h-3 shrink-0', isLive && 'text-primary animate-pulse')} />
            <span>{t('editor.rightPanel.deepThinking')}</span>
            <AguiExpandChevron open={isExpanded} />
          </button>
          {isLive && (
            <span className="inline-flex items-center justify-center w-3 h-3 shrink-0">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" />
            </span>
          )}
        </div>

        <AguiExpandableContent open={isExpanded} className="mt-1 ml-1">
          <div className="agui-thinking-body px-2 py-1.5 text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {text}
            {isLive && !text && <StreamLoading />}
          </div>
        </AguiExpandableContent>
      </div>
    </div>
  )
}

export const ReasoningPart = memo(ReasoningPartInner)
