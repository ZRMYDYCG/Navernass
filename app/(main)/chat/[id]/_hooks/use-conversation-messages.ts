'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { Message } from '@/lib/supabase/sdk/types'
import { conversationsApi, messagesApi } from '@/lib/supabase/sdk'
import { chatApi } from '@/lib/supabase/sdk/chat'
import { copyTextToClipboard } from '@/lib/utils'

interface UseConversationMessagesProps {
  conversationId: string
  initialMessage?: string
  isNewConversation?: boolean
}

export function useConversationMessages({
  conversationId,
  initialMessage,
  isNewConversation = false,
}: UseConversationMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(!isNewConversation)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [conversationTitle, setConversationTitle] = useState('Narraverse 对话')

  const isProcessingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const initialMessageSentRef = useRef(false)
  const userMessageIdRef = useRef<string | null>(null)

  const latestAssistantMessage = useMemo(() => {
    const assistantMessages = messages.filter(msg => msg.role === 'assistant')
    return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null
  }, [messages])

  const loadConversationHistory = useCallback(async (id: string) => {
    try {
      const [historyMessages, conversation] = await Promise.all([
        messagesApi.getByConversationId(id),
        conversationsApi.getById(id),
      ])
      setMessages(historyMessages)
      if (conversation?.title) setConversationTitle(conversation.title)
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      setMessages([])
    }
  }, [])

  const updateStreamingContent = useCallback((content: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === streamingMessageId ? { ...msg, content } : msg,
      ),
    )
  }, [streamingMessageId])

  const handleSendMessage = useCallback(
    async (content: string, onStreamingId?: (id: string) => void) => {
      if (!content.trim() || isLoading || isProcessingRef.current || !conversationId) return

      isProcessingRef.current = true
      setIsLoading(true)

      if (abortControllerRef.current) abortControllerRef.current.abort()
      abortControllerRef.current = new AbortController()

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

      const tempUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        conversation_id: conversationId,
        user_id: 'default-user',
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, tempUserMessage, tempAiMessage])

      try {
        await chatApi.sendMessageStream(
          { conversationId, message: content.trim() },
          {
            onUserMessageId: (id) => {
              userMessageIdRef.current = id
            },
            onContent: (chunk) => {
              updateStreamingContent(
                messages.find(m => m.id === tempAiMessageId)?.content
                  ? `${messages.find(m => m.id === tempAiMessageId)?.content}${chunk}`
                  : chunk,
              )
            },
            onDone: async () => {
              setStreamingMessageId(null)
              setIsLoading(false)
              isProcessingRef.current = false
              abortControllerRef.current = null

              await loadConversationHistory(conversationId)
            },
            onError: (error) => {
              throw new Error(error)
            },
          },
        )
      } catch (error) {
        console.error('Failed to send message:', error)

        setMessages(prev => prev.filter(msg => msg.id !== tempAiMessageId))
        setStreamingMessageId(null)
        setIsLoading(false)
        isProcessingRef.current = false
        abortControllerRef.current = null

        toast.error('发送失败，请重试')
      }
    },
    [conversationId, isLoading, loadConversationHistory, messages],
  )

  const handleRetry = useCallback(
    async (content: string) => {
      await handleSendMessage(content)
    },
    [handleSendMessage],
  )

  useEffect(() => {
    if (!conversationId || isNewConversation) return

    const initialize = async () => {
      setIsLoading(true)
      try {
        await loadConversationHistory(conversationId)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [conversationId, isNewConversation, loadConversationHistory])

  useEffect(() => {
    if (!conversationId || !initialMessage || initialMessageSentRef.current) return

    const sendInitialMessage = async () => {
      initialMessageSentRef.current = true
      await handleSendMessage(initialMessage)
    }

    sendInitialMessage()
  }, [conversationId, initialMessage, handleSendMessage])

  useEffect(() => {
    if (!conversationId || isNewConversation) return

    const fetchTitle = async () => {
      try {
        const conversation = await conversationsApi.getById(conversationId)
        if (conversation?.title) setConversationTitle(conversation.title)
      } catch (error) {
        console.error('Failed to load conversation title:', error)
      }
    }

    fetchTitle()
  }, [conversationId, isNewConversation])

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
