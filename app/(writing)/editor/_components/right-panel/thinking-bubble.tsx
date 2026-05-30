'use client'

import { Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'
import { memo, useMemo, useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { useI18n } from '@/hooks/use-i18n'
import { AguiExpandableContent, AguiExpandChevron } from './parts/agui-expandable'

interface ThinkingBubbleProps {
  thinking: string | null | undefined
  isStreaming?: boolean
}

function ThinkingBubbleInner({ thinking, isStreaming }: ThinkingBubbleProps) {
  const { theme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(true)
  const { t } = useI18n()

  const avatarSrc = useMemo(() => {
    return theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'
  }, [theme])

  if (!thinking || thinking.length === 0) {
    return null
  }

  return (
    <div className="flex gap-1.5 py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
      <div className="shrink-0">
        <Avatar className="w-5 h-5">
          <img src={avatarSrc} alt={t('editor.aiAvatarAlt')} className="w-full h-full object-cover" />
        </Avatar>
      </div>
      <div className="flex-1 w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
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
          <div className="agui-thinking-panel agui-thinking-body px-2.5 py-2 text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {thinking}
            {isStreaming && (
              <span className="inline-block w-[2px] h-[12px] ml-0.5 bg-primary align-middle animate-cursor-blink" />
            )}
          </div>
        </AguiExpandableContent>
      </div>
    </div>
  )
}

export const ThinkingBubble = memo(ThinkingBubbleInner)
