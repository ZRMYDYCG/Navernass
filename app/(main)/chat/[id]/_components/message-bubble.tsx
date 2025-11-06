'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { useTheme } from 'next-themes'

import { useEffect, useState } from 'react'

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

  const [displayedContent, setDisplayedContent] = useState(message.content)

  useEffect(() => {
    // 如果不是 AI 消息或者不需要打字机效果，直接显示全部内容
    if (!isAssistant || !isStreaming) {
      setDisplayedContent(message.content)
      return
    }

    // 启动打字机效果
    setDisplayedContent('')

    let currentIndex = 0
    const text = message.content
    const speed = 30 // 每个字符的显示间隔（毫秒）

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        currentIndex++
        setDisplayedContent(text.slice(0, currentIndex))
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => {
      clearInterval(timer)
      // 清理时确保显示完整内容
      setDisplayedContent(message.content)
    }
  }, [message.content, isStreaming, isAssistant])

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
                <div className="text-sm">
                  <MarkdownRenderer content={displayedContent || message.content} />
                </div>
              )}
        </div>
      </div>
    </div>
  )
}
