'use client'

import type { NovelMessage } from '@/lib/supabase/sdk/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './message-bubble'
import { ScrollToBottomButton } from './scroll-to-bottom-button'

const SCROLL_THRESHOLD = 100 // 距离底部多少像素时显示"回到底部"按钮

interface MessageListProps {
  messages: NovelMessage[]
  streamingMessageId?: string | null
}

export function MessageList({ messages, streamingMessageId = null }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const isNearBottomRef = useRef(true)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
  }

  // 检查是否接近底部
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

  // 当有新消息时，自动滚动到底部
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && messages.length > 0) {
      // 有新消息
      lastMessageCountRef.current = messages.length

      // 如果用户在底部附近，自动滚动到底部
      if (isNearBottomRef.current) {
        const timer = setTimeout(() => {
          scrollToBottom('smooth')
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [messages.length])

  // 当开始流式传输时，如果用户在底部附近，跟随内容
  // 如果用户向上滚动查看历史，则停止跟随
  useEffect(() => {
    if (streamingMessageId) {
      const interval = setInterval(() => {
        // 只有在用户接近底部时才跟随内容
        if (isNearBottomRef.current) {
          scrollToBottom('auto')
        }
      }, 100) // 每100ms检查一次

      return () => clearInterval(interval)
    }
  }, [streamingMessageId])

  // 初始化时滚动到底部
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom('auto')
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // 监听滚动事件
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
      <ScrollArea ref={scrollAreaRef} className="h-full w-full">
        <div className="space-y-1 pb-4">
          {messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={streamingMessageId === message.id}
            />
          ))}
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
