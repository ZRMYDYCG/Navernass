'use client'

import { Brain } from 'lucide-react'
import { memo, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { AguiExpandableContent, AguiExpandChevron } from './parts/agui-expandable'
import { StreamingPlainText } from './parts/streaming-plain-text'

interface ThinkingBubbleProps {
  thinking: string | null | undefined
  isStreaming?: boolean
}

function ThinkingBubbleInner({ thinking, isStreaming }: ThinkingBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { t } = useI18n()

  if (!thinking || thinking.length === 0) {
    return null
  }

  return (
    <div className="py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
      <div className="w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Brain className="w-3 h-3" />
            <span>{t('editor.rightPanel.deepThinking')}</span>
            <AguiExpandChevron open={isExpanded} />
          </button>
          {isStreaming && (
            <span className="inline-flex items-center justify-center w-3 h-3">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" />
            </span>
          )}
        </div>

        <AguiExpandableContent open={isExpanded} className="mt-1 ml-1">
          <div className="agui-thinking-body px-2 py-1.5 text-[10px] text-muted-foreground leading-relaxed">
            <StreamingPlainText content={thinking} isStreaming={isStreaming} />
          </div>
        </AguiExpandableContent>
      </div>
    </div>
  )
}

export const ThinkingBubble = memo(ThinkingBubbleInner)
