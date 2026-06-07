'use client'

import type { UIMessage } from 'ai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { CHAT_CONFIG } from '../constants'
import { MessageRenderer } from './parts/message-renderer'
import { ScrollToBottomButton } from './scroll-to-bottom-button'
import { TypingIndicator } from './typing-indicator'

interface ChatMessageListProps {
  messages: UIMessage[]
  isLoading?: boolean
  streamingMessageId?: string | null
  onCopyMessage?: (message: UIMessage) => void
  onShareMessage?: (message: UIMessage) => void
}

const SCROLL_THRESHOLD = 100

/**
 * Chat Agent 消息列表：使用 AG-UI 风格的 parts/registry 渲染器。
 *
 * 与原有 message-list.tsx 的区别：
 *   - 默认走 MessageRenderer（支持 reasoning/tool-* parts）
 *   - share 模式选择消息仍走 MessageBubble（见 message-list.tsx）
 */
export function ChatMessageList({
  messages,
  isLoading = false,
  streamingMessageId = null,
}: ChatMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)
  const lastStreamingLengthRef = useRef(0)
  const isNearBottomRef = useRef(true)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (container) {
      if (behavior === 'auto') {
        container.scrollTop = container.scrollHeight
      } else {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
    }
  }, [])

  const checkIfNearBottom = useCallback(() => {
    const container = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (!container) return true
    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD
  }, [])

  const handleScroll = useCallback(() => {
    const isNearBottom = checkIfNearBottom()
    isNearBottomRef.current = isNearBottom
    setShowScrollButton(!isNearBottom)
  }, [checkIfNearBottom])

  const handleScrollToBottom = useCallback(() => {
    isNearBottomRef.current = true
    setShowScrollButton(false)
    scrollToBottom('smooth')
  }, [scrollToBottom])

  // 新消息到来时滚动
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && messages.length > 0) {
      lastMessageCountRef.current = messages.length
      if (isNearBottomRef.current) {
        const t = setTimeout(() => scrollToBottom('smooth'), 100)
        return () => clearTimeout(t)
      }
    }
  }, [messages.length, scrollToBottom])

  // 流式期间：观察文本长度变化触发滚动
  useEffect(() => {
    if (!streamingMessageId) {
      lastStreamingLengthRef.current = 0
      return
    }
    const m = messages.find(msg => msg.id === streamingMessageId)
    if (!m) {
      lastStreamingLengthRef.current = 0
      return
    }
    let length = 0
    for (const p of m.parts || []) {
      if (p.type === 'text' || p.type === 'reasoning') {
        length += (p as { text: string }).text.length
      }
    }
    if (length > lastStreamingLengthRef.current && isNearBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom('auto'))
    }
    lastStreamingLengthRef.current = length
  }, [messages, streamingMessageId, scrollToBottom])

  // 流式期间周期性吸底
  useEffect(() => {
    if (!streamingMessageId) return
    const id = setInterval(() => {
      if (isNearBottomRef.current) scrollToBottom('auto')
    }, 50)
    return () => clearInterval(id)
  }, [streamingMessageId, scrollToBottom])

  // 首次挂载滚动到底
  useEffect(() => {
    if (messages.length > 0) {
      const t = setTimeout(() => scrollToBottom('smooth'), 100)
      return () => clearTimeout(t)
    }
  }, [messages.length, scrollToBottom])

  useEffect(() => {
    const container = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!container) return
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className="relative flex-1 h-full">
      <ScrollArea ref={scrollAreaRef} className="relative h-full w-full">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && isLoading && (
            <div className="w-full space-y-6 py-4">
              <div className="flex justify-end">
                <div className="flex flex-col items-end gap-2 w-[88%]">
                  <Skeleton className="h-3 w-16" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-[88%]" />
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="flex gap-3 w-[95%]">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex flex-col gap-3 flex-1">
                    <Skeleton className="h-3 w-20" />
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[93%]" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[96%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-1 py-2">
              {messages.map(message => (
                <MessageRenderer
                  key={message.id}
                  message={message}
                  isStreaming={streamingMessageId === message.id}
                />
              ))}

              {isLoading && !streamingMessageId && <TypingIndicator />}

              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </div>
      </ScrollArea>

      <ScrollToBottomButton
        show={showScrollButton}
        onClick={handleScrollToBottom}
      />
    </div>
  )
}
