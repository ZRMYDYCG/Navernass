'use client'

import type { Message } from '@/lib/supabase/sdk/types'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { InlineLoading } from '@/components/loading'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CHAT_CONFIG } from '../config'
import { MessageBubble } from './message-bubble'
import { ScrollToBottomButton } from './scroll-to-bottom-button'
import { TypingIndicator } from './typing-indicator'

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  isStreaming?: boolean
}

export function MessageList({ messages, isLoading = false, isStreaming = false }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [_isUserScrolling, setIsUserScrolling] = useState(false)
  const isNearBottomRef = useRef(true)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth', resetUserScrolling = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
    if (resetUserScrolling) {
      setIsUserScrolling(false)
    }
  }

  // 检查是否接近底部
  const checkIfNearBottom = useCallback(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!scrollContainer)
      return true

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    return distanceFromBottom < CHAT_CONFIG.SCROLL_THRESHOLD
  }, [])

  const handleScroll = useCallback(() => {
    const isNearBottom = checkIfNearBottom()
    isNearBottomRef.current = isNearBottom

    // 如果用户向上滚动且不在底部附近，显示"回到底部"按钮
    if (!isNearBottom) {
      setShowScrollButton(true)
      setIsUserScrolling(true)
    } else {
      setShowScrollButton(false)
      setIsUserScrolling(false)
    }
  }, [checkIfNearBottom])

  // 当有新消息时，自动滚动到底部
  // 规则：总是自动滚动到底部，因为用户发送消息后想看到最新内容
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && messages.length > 0) {
      // 有新消息
      lastMessageCountRef.current = messages.length

      // 总是滚动到底部
      const timer = setTimeout(() => {
        scrollToBottom('smooth')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [messages.length])

  // 当开始流式传输时，如果用户在底部附近，跟随内容
  // 如果用户向上滚动查看历史，则停止跟随
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        // 只有在用户接近底部时才跟随内容
        if (isNearBottomRef.current) {
          scrollToBottom('auto')
        }
      }, 100) // 每100ms检查一次

      return () => clearInterval(interval)
    }
  }, [isStreaming])

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom('auto')
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!scrollContainer)
      return

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className="relative flex-1 h-full">
      <ScrollArea ref={scrollAreaRef} className="h-full w-full">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0
            ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  {isLoading
                    ? (
                        <InlineLoading text="加载对话历史..." />
                      )
                    : (
                        <p>开始对话吧...</p>
                      )}
                </div>
              )
            : (
                <div className="space-y-1">
                  {messages.map(message => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isStreaming={isStreaming && message.id === messages[messages.length - 1].id}
                    />
                  ))}

                  {isLoading && <TypingIndicator />}

                  <div ref={messagesEndRef} className="h-1" />
                </div>
              )}
        </div>
      </ScrollArea>

      <ScrollToBottomButton
        show={showScrollButton}
        onClick={() => scrollToBottom('smooth', true)}
      />
    </div>
  )
}
