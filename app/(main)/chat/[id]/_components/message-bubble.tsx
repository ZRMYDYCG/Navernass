'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { CheckCircle2, Circle, Copy, Edit, Share2 } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MarkdownRenderer } from './markdown-renderer'

interface MessageBubbleProps {
  message: Message
  onCopy?: (message: Message) => void
  onShare?: (message: Message) => void
  onEdit?: (message: Message) => void
  isShareMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (messageId: string) => void
  alwaysShowActions?: boolean
}

export function MessageBubble({
  message,
  onCopy,
  onEdit,
  isShareMode = false,
  isSelected = false,
  onToggleSelect,
  alwaysShowActions = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const { theme } = useTheme()

  // 流式消息直接显示 message.content（实时更新，不需要打字机效果特殊处理，因为流式本身就是逐字输出）
  const displayedContent = message.content

  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'
  const shouldAlwaysShowActions = alwaysShowActions || isShareMode

  return (
    <div className={`group/message flex gap-4 py-4 px-4 sm:px-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="shrink-0">
        {isAssistant && (
          <Avatar className="w-8 h-8">
            <img src={avatarSrc} alt="AI Avatar" className="w-full h-full object-cover" />
          </Avatar>
        )}
      </div>

      {/* 消息内容 */}
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
          <div
            className={cn(
              'rounded-2xl px-4 py-3 border border-transparent transition-all w-fit max-w-full',
              isUser
                ? 'bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100'
                : 'dark:bg-zinc-800 text-gray-900 dark:text-gray-100 bg-white',
              isShareMode && (isSelected ? 'ring-2 ring-primary/70 border-primary/60' : 'ring-1 ring-transparent'),
            )}
          >
            {isUser
              ? (
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                )
              : (
                  <div className="text-sm relative">
                    <MarkdownRenderer content={displayedContent} />
                  </div>
                )}
          </div>

          <div
            className={cn(
              'flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 transition-opacity',
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
                <span>{isSelected ? '已选中' : '选择'}</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onCopy?.(message)}
            >
              <Copy className="w-4 h-4" />
              <span>复制</span>
            </Button>

            {isAssistant && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onEdit?.(message)}
              >
                <Edit className="w-4 h-4" />
                <span>编辑</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}