'use client'

import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Avatar } from '@/components/ui/avatar'

interface ThinkingBubbleProps {
  thinking: string | null | undefined
  isStreaming?: boolean
}

export function ThinkingBubble({ thinking, isStreaming }: ThinkingBubbleProps) {
  const { theme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'

  if (!thinking || thinking.length === 0) {
    return null
  }

  return (
    <div className="flex gap-1.5 py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
      <div className="shrink-0">
        <Avatar className="w-5 h-5">
          <img src={avatarSrc} alt="AI Avatar" className="w-full h-full object-cover" />
        </Avatar>
      </div>
      <div className="flex-1 max-w-[85%] sm:max-w-md lg:max-w-lg">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>深度思考</span>
            {isExpanded
              ? <ChevronUp className="w-3 h-3" />
              : <ChevronDown className="w-3 h-3" />
            }
          </button>
          {isStreaming && (
            <span className="inline-flex items-center justify-center w-3 h-3">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" />
            </span>
          )}
        </div>

        {isExpanded && (
          <div className="mt-1 ml-1 rounded px-2.5 py-2 text-[10px] bg-accent/50 text-muted-foreground whitespace-pre-wrap">
            {thinking}
          </div>
        )}
      </div>
    </div>
  )
}
