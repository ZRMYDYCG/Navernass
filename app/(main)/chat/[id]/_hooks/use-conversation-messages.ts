'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { conversationsApi, messagesApi } from '@/lib/supabase/sdk'
import { copyTextToClipboard } from '@/lib/utils'

interface UseConversationMessagesProps {
  conversationId: string
  initialMessage?: string
}

export function useConversationMessages({ conversationId, initialMessage }: UseConversationMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [conversationTitle, setConversationTitle] = useState('Narraverse 对话')

  const isProcessingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const initialMessageSentRef = useRef(false)

  const latestAssistantMessage = useMemo(() => {
    const assistantMessages = messages.filter(msg => msg.role === 'assistant')
    return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null
  }, [messages])

  const loadConversationHistory = useCallback(async (id: string) => {
    try {
      const historyMessages = await messagesApi.getByConversationId(id)
      setMessages(historyMessages)
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      setMessages([])
    }
  }, [])

  const streamMessage = useCallback(async (content: string, tempAiMessageId: string) => {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message: content.trim() }),
    })

    if (!response.ok) throw new Error('Failed to send message')

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    if (!reader) throw new Error('No response body')

    let buffer = ''
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

        try {
          const jsonStr = trimmedLine.slice(6)
          const event = JSON.parse(jsonStr)

          if (event.type === 'content') {
            fullContent += event.data
            setMessages(prev =>
              prev.map(msg => msg.id === tempAiMessageId ? { ...msg, content: fullContent } : msg),
            )
          }
        } catch {
          console.warn('Failed to parse SSE event:', trimmedLine)
        }
      }
    }

    return fullContent
  }, [conversationId])

  const handleSendMessage = useCallback(async (content: string, onStreamingId?: (id: string) => void) => {
    if (!content.trim() || isLoading || isProcessingRef.current || !conversationId) return

    isProcessingRef.current = true
    setIsLoading(true)

    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()

    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      user_id: 'default-user',
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, tempUserMessage])

    const tempAiMessageId = `temp-ai-${Date.now()}`
    setStreamingMessageId(tempAiMessageId)
    onStreamingId?.(tempAiMessageId)

    const tempAiMessage: Message = {
      id: tempAiMessageId,
      conversation_id: conversationId,
      user_id: 'default-user',
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, tempAiMessage])

    try {
      await streamMessage(content, tempAiMessageId)

      setStreamingMessageId(null)
      setIsLoading(false)
      isProcessingRef.current = false
      abortControllerRef.current = null

      await loadConversationHistory(conversationId)
    } catch (error) {
      console.error('Failed to send message:', error)

      setMessages(prev => prev.filter(msg => msg.id !== tempAiMessageId))
      setStreamingMessageId(null)
      setIsLoading(false)
      isProcessingRef.current = false
      abortControllerRef.current = null

      toast.error('发送失败，请重试')
    }
  }, [conversationId, isLoading, loadConversationHistory, streamMessage])

  const handleRetry = useCallback(async (content: string) => {
    await handleSendMessage(content)
  }, [handleSendMessage])

  useEffect(() => {
    if (!conversationId) return

    const initialize = async () => {
      setIsLoading(true)
      try {
        await loadConversationHistory(conversationId)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [conversationId, loadConversationHistory])

  useEffect(() => {
    if (!conversationId || !initialMessage || initialMessageSentRef.current) return

    const sendInitialMessage = async () => {
      initialMessageSentRef.current = true
      await handleSendMessage(initialMessage)
    }

    sendInitialMessage()
  }, [conversationId, initialMessage, handleSendMessage])

  useEffect(() => {
    const fetchTitle = async () => {
      if (!conversationId) return
      try {
        const conversation = await conversationsApi.getById(conversationId)
        if (conversation?.title) setConversationTitle(conversation.title)
      } catch (error) {
        console.error('Failed to load conversation title:', error)
      }
    }

    fetchTitle()
  }, [conversationId])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  return {
    messages,
    setMessages,
    isLoading,
    streamingMessageId,
    conversationTitle,
    latestAssistantMessage,
    handleSendMessage,
    handleRetry,
    handleCopyMessage: async (message: Message) => {
      if (!message?.content) return
      try {
        await copyTextToClipboard(message.content)
        toast.success('消息内容已复制')
      } catch (error) {
        console.error('Failed to copy message:', error)
        toast.error('复制失败，请重试')
      }
    },
    handleShareMessage: async (message: Message) => {
      if (!message?.content) return
      const sharePayload = { title: '来自 Narraverse 的聊天消息', text: message.content }
      try {
        if ('share' in navigator && typeof navigator.share === 'function') {
          await navigator.share(sharePayload)
        } else {
          await copyTextToClipboard(message.content)
          toast.success('已复制消息内容，粘贴即可分享')
        }
      } catch (error) {
        console.error('Failed to share message:', error)
        toast.error('分享失败，请稍后再试')
      }
    },
  }
}
