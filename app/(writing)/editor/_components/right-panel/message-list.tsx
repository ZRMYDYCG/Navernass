'use client'

import type { UIMessage } from 'ai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/use-auth'
import { MessageRenderer } from './parts/message-renderer'
import { ScrollToBottomButton } from './scroll-to-bottom-button'
import { TypingIndicator } from './typing-indicator'

const SCROLL_THRESHOLD = 100

interface MessageListProps {
  messages: UIMessage[]
  /** 当前正在流式输出的消息 id */
  streamingMessageId?: string | null
  /** 是否正在等待 AI 第一条响应（typing 指示器） */
  isLoading?: boolean
}

/**
 * AG-UI 风格消息列表：直接渲染 UIMessage[]。
 * 不再做 UIMessage <-> NovelMessage 适配。
 */
export function MessageList({
  messages,
  streamingMessageId = null,
  isLoading = false,
}: MessageListProps) {
  const { profile } = useAuth()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)
  const lastStreamingLengthRef = useRef(0)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const isNearBottomRef = useRef(true)

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
    const container = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!container) return true
    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD
  }, [])

  const handleScroll = useCallback(() => {
    const near = checkIfNearBottom()
    isNearBottomRef.current = near
    setShowScrollButton(!near)
  }, [checkIfNearBottom])

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

  // typing 指示器出现时
  useEffect(() => {
    if (isLoading && isNearBottomRef.current) {
      const t = setTimeout(() => scrollToBottom('smooth'), 100)
      return () => clearTimeout(t)
    }
  }, [isLoading, scrollToBottom])

  // 流式输出过程中：观察当前流式消息的总文本长度变化以触发滚动
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

  // 首次挂载（已有消息）滚动到底
  useEffect(() => {
    if (messages.length > 0) {
      const t = setTimeout(() => {
        const container = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
        if (container) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
      }, 100)
      return () => clearTimeout(t)
    }
  }, [messages.length])

  useEffect(() => {
    const container = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!container) return
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (messages.length === 0) return null

  return (
    <div className="relative h-full w-full">
      <ScrollArea
        ref={scrollAreaRef}
        className="h-full w-full overflow-x-hidden [&_[data-radix-scroll-area-viewport]]:overflow-x-hidden [&_[data-radix-scroll-area-viewport]]:pr-3"
      >
        <div className="space-y-1 pb-4">
          {messages.map(message => (
            <MessageRenderer
              key={message.id}
              message={message}
              isStreaming={streamingMessageId === message.id}
              userAvatar={profile?.avatar_url}
            />
          ))}
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
