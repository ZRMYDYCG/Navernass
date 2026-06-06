'use client'

import type { UIMessage } from 'ai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { CHAT_CONFIG } from '../config'
import { MessageBubble } from './message-bubble'
import { ScrollToBottomButton } from './scroll-to-bottom-button'
import { TypingIndicator } from './typing-indicator'

interface MessageListProps {
  messages: UIMessage[]
  isLoading?: boolean
  streamingMessageId?: string | null
  onCopyMessage?: (message: UIMessage) => void
  onShareMessage?: (message: UIMessage) => void
  isShareMode?: boolean
  selectedMessageIds?: string[]
  onToggleSelectMessage?: (messageId: string) => void
}

export function MessageList({
  messages,
  isLoading = false,
  streamingMessageId = null,
  onCopyMessage,
  onShareMessage,
  isShareMode = false,
  selectedMessageIds: selectedMessageIdsProp,
  onToggleSelectMessage,
}: MessageListProps) {
  const selectedMessageIds = selectedMessageIdsProp ?? []

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

  const checkIfNearBottom = useCallback((container?: HTMLElement | null) => {
    const scrollContainer
      = container ?? (scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null)
    if (!scrollContainer)
      return true

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    return distanceFromBottom < CHAT_CONFIG.SCROLL_THRESHOLD
  }, [])

  const handleScroll = useCallback(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (!scrollContainer)
      return

    const isNearBottom = checkIfNearBottom(scrollContainer)
    isNearBottomRef.current = isNearBottom

    if (!isNearBottom) {
      setShowScrollButton(true)
      setIsUserScrolling(true)
    } else {
      setShowScrollButton(false)
      setIsUserScrolling(false)
    }
  }, [checkIfNearBottom])

  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && messages.length > 0) {
      lastMessageCountRef.current = messages.length

      const timer = setTimeout(() => {
        scrollToBottom('smooth')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [messages.length])

  useEffect(() => {
    if (streamingMessageId) {
      const interval = setInterval(() => {
        if (isNearBottomRef.current) {
          scrollToBottom('auto')
        }
      }, 100)

      return () => clearInterval(interval)
    }
  }, [streamingMessageId])

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

              <div className="flex justify-end">
                <div className="flex flex-col items-end gap-2 w-[82%]">
                  <Skeleton className="h-3 w-16" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
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
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[88%]" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[92%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-1">
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1
                const shouldAlwaysShowActions = isShareMode || (isLastMessage && !streamingMessageId && !isLoading)
                const isStreaming = streamingMessageId === message.id
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onCopy={onCopyMessage}
                    onShare={onShareMessage}
                    isShareMode={isShareMode}
                    isSelected={selectedMessageIds.includes(message.id)}
                    onToggleSelect={onToggleSelectMessage}
                    alwaysShowActions={shouldAlwaysShowActions}
                    isStreaming={isStreaming}
                  />
                )
              })}

              {isLoading && !streamingMessageId && <TypingIndicator />}

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
