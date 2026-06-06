'use client'

import type { UIMessage } from 'ai'
import { useCallback, useEffect, useRef } from 'react'
import { MessageRenderer } from './parts/message-renderer'
import { TypingIndicator } from './typing-indicator'

const SCROLL_THRESHOLD = 100

interface MessageListProps {
  novelId: string
  messages: UIMessage[]
  /** 当前正在流式输出的消息 id */
  streamingMessageId?: string | null
  /** 已发送、正在建立连接（尚无助手消息占位） */
  isAwaitingConnection?: boolean
}

/**
 * AG-UI 风格消息列表：直接渲染 UIMessage[]。
 * 不再做 UIMessage <-> NovelMessage 适配。
 */
export function MessageList({
  novelId,
  messages,
  streamingMessageId = null,
  isAwaitingConnection = false,
}: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)
  const lastStreamingLengthRef = useRef(0)
  const isNearBottomRef = useRef(true)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current
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
    const container = scrollContainerRef.current
    if (!container) return true
    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD
  }, [])

  const handleScroll = useCallback(() => {
    isNearBottomRef.current = checkIfNearBottom()
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

  // 建立连接指示器出现时吸底
  useEffect(() => {
    if (isAwaitingConnection && isNearBottomRef.current) {
      const t = setTimeout(() => scrollToBottom('smooth'), 100)
      return () => clearTimeout(t)
    }
  }, [isAwaitingConnection, scrollToBottom])

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
      const t = setTimeout(() => scrollToBottom('smooth'), 100)
      return () => clearTimeout(t)
    }
  }, [messages.length, scrollToBottom])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (messages.length === 0) return null

  return (
    <div
      ref={scrollContainerRef}
      className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-none px-5"
    >
      <div className="agui-log space-y-1 pb-4">
        {messages.map(message => (
          <MessageRenderer
            key={message.id}
            novelId={novelId}
            message={message}
            isStreaming={streamingMessageId === message.id}
          />
        ))}
        {isAwaitingConnection ? (
          <div className="py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 flex justify-start">
            <TypingIndicator tone="connecting" />
          </div>
        ) : null}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  )
}
