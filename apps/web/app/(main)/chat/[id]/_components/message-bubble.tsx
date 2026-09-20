'use client'

import type { UIMessage } from 'ai'
import { CheckCircle2, Circle, Copy, Eye, EyeOff } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'
import {
  extractReasoningFromUIMessage,
  extractTextFromUIMessage,
} from '@/lib/chat/chat-messages'
import { cn } from '@/lib/utils'
import { MarkdownRenderer } from './markdown-renderer'

interface MessageBubbleProps {
  message: UIMessage
  onCopy?: (message: UIMessage) => void
  onShare?: (message: UIMessage) => void
  isShareMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (messageId: string) => void
  alwaysShowActions?: boolean
  isStreaming?: boolean
}

export function MessageBubble({
  message,
  onCopy,
  isShareMode = false,
  isSelected = false,
  onToggleSelect,
  alwaysShowActions = false,
  isStreaming = false,
}: MessageBubbleProps) {
  const { t } = useI18n()
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const { theme } = useTheme()

  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false)

  const text = extractTextFromUIMessage(message)
  const reasoning = extractReasoningFromUIMessage(message)
  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'
  const shouldAlwaysShowActions = alwaysShowActions || isShareMode

  const showLoading = isAssistant && isStreaming && !text && !reasoning
  const showContent = Boolean(text) || !isStreaming

  return (
    <div className={`group/message flex gap-4 py-4 px-4 sm:px-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="shrink-0">
        {isAssistant && (
          <Avatar className="w-8 h-8">
            <img src={avatarSrc} alt={t('chat.messageBubble.aiAvatarAlt')} className="w-full h-full object-cover" />
          </Avatar>
        )}
      </div>

      {showLoading && (
        <div className="flex items-center h-8">
          <div className="flex gap-1 items-center">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          </div>
        </div>
      )}

      {showContent && (
        <div
          className={cn(
            'flex-1',
            isUser ? 'flex justify-end' : 'flex justify-start',
            isUser ? 'max-w-[75%]' : 'max-w-[85%]',
          )}
        >
          <div
            className={cn(
              'flex flex-col gap-2 max-w-full',
              isUser ? 'items-end' : 'items-start',
            )}
          >
            {isAssistant && reasoning && (
              <div className="w-full rounded-xl border border-dashed border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setIsReasoningExpanded(v => !v)}
                  className="flex w-full items-center gap-1.5 text-left font-medium hover:text-foreground"
                >
                  {isReasoningExpanded
                    ? <EyeOff className="h-3.5 w-3.5" />
                    : <Eye className="h-3.5 w-3.5" />}
                  <span>{t('chat.messageBubble.thinking')}</span>
                </button>
                {isReasoningExpanded && (
                  <div className="mt-2 whitespace-pre-wrap break-words text-foreground/80">
                    {reasoning}
                  </div>
                )}
              </div>
            )}

            <div
              className={cn(
                'rounded-2xl px-4 py-3 border border-transparent transition-all w-fit max-w-full',
                isUser
                  ? 'bg-secondary text-foreground'
                  : 'bg-card text-foreground',
                isShareMode && (isSelected ? 'ring-2 ring-primary/70 border-primary/60' : 'ring-1 ring-transparent'),
              )}
            >
              {isUser
                ? (
                    <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
                  )
                : (
                    <div className="text-sm relative">
                      <MarkdownRenderer content={text} />
                    </div>
                  )}
            </div>

            <div
              className={cn(
                'flex items-center gap-2 text-xs text-muted-foreground transition-opacity',
                isUser ? 'justify-end' : 'justify-start',
                shouldAlwaysShowActions
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none group-hover/message:opacity-100 group-hover/message:pointer-events-auto',
              )}
            >
              {isShareMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onToggleSelect?.(message.id)}
                  aria-pressed={isSelected}
                >
                  {isSelected ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4" />}
                  <span>{isSelected ? t('chat.messageBubble.selected') : t('chat.messageBubble.select')}</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onCopy?.(message)}
              >
                <Copy className="w-4 h-4" />
                <span>{t('chat.messageBubble.copy')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
