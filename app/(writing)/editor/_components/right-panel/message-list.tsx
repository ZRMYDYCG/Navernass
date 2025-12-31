'use client'

import type { NovelMessage } from '@/lib/supabase/sdk/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/use-auth'
import { MessageBubble } from './message-bubble'
import { ScrollToBottomButton } from './scroll-to-bottom-button'
import { ThinkingBubble } from './thinking-bubble'
import { TypingIndicator } from './typing-indicator'

const SCROLL_THRESHOLD = 100

interface MessageListProps {
  messages: NovelMessage[]
  streamingMessageId?: string | null
  isLoading?: boolean
}

export function MessageList({ messages, streamingMessageId = null, isLoading = false }: MessageListProps) {
  const { profile } = useAuth()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)
  const lastStreamingContentLengthRef = useRef(0)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const isNearBottomRef = useRef(true)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    if (scrollContainer) {
      if (behavior === 'auto') {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      } else {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth',
        })
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
    }
  }, [])

  const checkIfNearBottom = useCallback(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!scrollContainer)
      return true

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    return distanceFromBottom < SCROLL_THRESHOLD
  }, [])

  const handleScroll = useCallback(() => {
    const isNearBottom = checkIfNearBottom()
    isNearBottomRef.current = isNearBottom

    // 如果用户向上滚动且不在底部附近，显示"回到底部"按钮
    if (!isNearBottom) {
      setShowScrollButton(true)
    } else {
      setShowScrollButton(false)
    }
  }, [checkIfNearBottom])

  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && messages.length > 0) {
      lastMessageCountRef.current = messages.length

      if (isNearBottomRef.current) {
        const timer = setTimeout(() => {
          scrollToBottom('smooth')
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [messages.length, scrollToBottom])

  useEffect(() => {
    if (isLoading && isNearBottomRef.current) {
      const timer = setTimeout(() => {
        scrollToBottom('smooth')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading, scrollToBottom])

  useEffect(() => {
    if (streamingMessageId) {
      const streamingMessage = messages.find(msg => msg.id === streamingMessageId)
      if (streamingMessage) {
        const currentContentLength = streamingMessage.content.length
        if (currentContentLength > lastStreamingContentLengthRef.current && isNearBottomRef.current) {
          requestAnimationFrame(() => {
            scrollToBottom('auto')
          })
          lastStreamingContentLengthRef.current = currentContentLength
        }
      } else {
        lastStreamingContentLengthRef.current = 0
      }
    } else {
      lastStreamingContentLengthRef.current = 0
    }
  }, [messages, streamingMessageId, scrollToBottom])

  useEffect(() => {
    if (streamingMessageId) {
      lastStreamingContentLengthRef.current = 0

      const interval = setInterval(() => {
        if (isNearBottomRef.current) {
          scrollToBottom('auto')
        }
      }, 50) // 每50ms检查一次

      return () => clearInterval(interval)
    } else {
      lastStreamingContentLengthRef.current = 0
    }
  }, [streamingMessageId, scrollToBottom])

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth',
          })
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [messages.length])

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!scrollContainer)
      return

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (messages.length === 0) {
    return null
  }

  return (
    <div className="relative h-full w-full">
      <ScrollArea
        ref={scrollAreaRef}
        className="h-full w-full overflow-x-hidden [&_[data-radix-scroll-area-viewport]]:overflow-x-hidden [&_[data-radix-scroll-area-viewport]]:pr-3"
      >
        <div className="space-y-1 pb-4">
          {messages.map((message) => {
            const isCurrentMessageStreaming = streamingMessageId === message.id
            const showContent = !isCurrentMessageStreaming || (message.content && message.content.length > 0)

            return (
              <div key={message.id} className="flex flex-col">
                <ThinkingBubble
                  thinking={message.thinking}
                  isStreaming={isCurrentMessageStreaming}
                />
                {showContent && (
                  <MessageBubble
                    message={message}
                    streamingMessageId={streamingMessageId}
                    userAvatar={profile?.avatar_url}
                  />
                )}
              </div>
            )
          })}
          {isLoading && !streamingMessageId && <TypingIndicator />}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>

      <ScrollToBottomButton
        show={showScrollButton}
        onClick={() => scrollToBottom('smooth')}
      />
    </div>
  )
}
