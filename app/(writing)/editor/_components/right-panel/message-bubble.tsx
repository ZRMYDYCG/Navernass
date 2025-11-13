'use client'

import type { NovelMessage } from '@/lib/supabase/sdk/types'
import { useTheme } from 'next-themes'
import { MarkdownRenderer } from '@/app/(main)/chat/[id]/_components/markdown-renderer'
import { Avatar } from '@/components/ui/avatar'

interface MessageBubbleProps {
  message: NovelMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const { theme } = useTheme()

  const displayedContent = message.content

  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'

  return (
    <div className={`flex gap-3 py-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0">
        {isAssistant && (
          <Avatar className="w-7 h-7">
            <img src={avatarSrc} alt="AI Avatar" className="w-full h-full object-cover" />
          </Avatar>
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <div
          className={`rounded-xl px-3 py-2 text-sm ${
            isUser
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
          }`}
        >
          {isUser
            ? (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )
            : (
                <div className="relative">
                  <MarkdownRenderer content={displayedContent} />
                </div>
              )}
        </div>
      </div>
    </div>
  )
}
