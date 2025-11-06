'use client'

import type { Message } from '../types'
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

  const [displayedContent, setDisplayedContent] = useState('')
  const [isTyping, setIsTyping] = useState(isStreaming)

  useEffect(() => {
    if (!isStreaming || !isAssistant) {
      setDisplayedContent(message.content)
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    let currentIndex = 0
    const text = message.content

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedContent(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 30) // 30ms per character

    return () => clearInterval(timer)
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
              ? 'bg-gray-100'
              : 'dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          } ${message.status === 'error' ? 'border-2 border-red-500' : ''}`}
        >
          {isUser
            ? (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )
            : (
                <div className="text-sm">
                  <MarkdownRenderer content={displayedContent || message.content} />
                  {isTyping && (
                    <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
                  )}
                </div>
              )}

          {message.error && (
            <p className="text-xs text-red-300 mt-2">{message.error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
