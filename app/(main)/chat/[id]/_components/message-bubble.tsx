'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { useTheme } from 'next-themes'

import { Avatar } from '@/components/ui/avatar'
import { MarkdownRenderer } from './markdown-renderer'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const { theme } = useTheme()

  // 流式消息直接显示 message.content（实时更新，不需要打字机效果特殊处理，因为流式本身就是逐字输出）
  const displayedContent = message.content

  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'

  return (
    <div className={`flex gap-4 py-4 px-4 sm:px-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0">
        {isAssistant && (
          <Avatar className="w-8 h-8">
            <img src={avatarSrc} alt="AI Avatar" className="w-full h-full object-cover" />
          </Avatar>
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              : 'dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}
        >
          {isUser
            ? (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )
            : (
                <div
                  className={`text-sm relative ${
                    isStreaming
                      ? 'after:content-[""] after:absolute after:bottom-0 after:right-0 after:w-12 after:h-6 after:bg-gradient-to-r after:from-transparent after:to-gray-100 dark:after:to-gray-800 after:animate-pulse after:pointer-events-none'
                      : ''
                  }`}
                >
                  <MarkdownRenderer content={displayedContent} />
                </div>
              )}
        </div>
      </div>
    </div>
  )
}
