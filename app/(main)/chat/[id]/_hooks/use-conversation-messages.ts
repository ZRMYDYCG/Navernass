'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'
import { conversationsApi, messagesApi } from '@/lib/supabase/sdk'
import { chatApi } from '@/lib/supabase/sdk/chat'
import { copyTextToClipboard } from '@/lib/utils'

const processedInitialMessages = new Set<string>()

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
  const { t } = useI18n()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [conversationTitle, setConversationTitle] = useState(t('chat.welcomeHeader.fallbackTitle'))

  const isProcessingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isStreamingRef = useRef(false)

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

  const loadConversationHistorySilently = useCallback(async (id: string) => {
    try {
      const historyMessages = await messagesApi.getByConversationId(id)
      setMessages(historyMessages)
    } catch (error) {
      console.error('Failed to load conversation history silently:', error)
    }
  }, [])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || isProcessingRef.current || !conversationId) return

    isProcessingRef.current = true
    setIsLoading(true)
    isStreamingRef.current = true

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const messageContent = content.trim()

    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      user_id: 'default-user',
      role: 'user',
      content: messageContent,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMessage])

    let aiMessageId: string | null = null
    let accumulatedContent = ''
    let newConversationId = conversationId

    try {
      await chatApi.sendMessageStream(
        { conversationId, message: messageContent },
        {
          onConversationId: (id, created) => {
            newConversationId = id
            if (created && conversationId !== id) {
              setConversationTitle(t('chat.welcomeHeader.fallbackTitle'))
            }
          },
          onUserMessageId: (id) => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === tempUserMessage.id ? { ...msg, id } : msg,
              ),
            )
          },
          onContent: (chunk) => {
            if (!chunk) return

            accumulatedContent += chunk
            if (!aiMessageId) {
              const tempAiMessage: Message = {
                id: `temp-ai-${Date.now()}`,
                conversation_id: newConversationId,
                user_id: 'default-user',
                role: 'assistant',
                content: accumulatedContent,
                created_at: new Date().toISOString(),
              }
              aiMessageId = tempAiMessage.id
              setStreamingMessageId(aiMessageId)
              setMessages(prev => [...prev, tempAiMessage])
            } else {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg,
                ),
              )
            }
          },
          onDone: async () => {
            setStreamingMessageId(null)
            setIsLoading(false)
            isProcessingRef.current = false
            abortControllerRef.current = null
            isStreamingRef.current = false

            if (newConversationId) {
              await loadConversationHistorySilently(newConversationId)
            }
          },
          onError: (error) => {
            throw new Error(error)
          },
        },
      )
    } catch (error) {
      console.error('Failed to send message:', error)

      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id && msg.id !== aiMessageId))
      setStreamingMessageId(null)
      setIsLoading(false)
      isProcessingRef.current = false
      abortControllerRef.current = null
      isStreamingRef.current = false

      toast.error(t('chat.messages.sendFailedRetry'))
    }
  }, [conversationId, isLoading, loadConversationHistorySilently, t])

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
    // 避免重复处理同一条初始消息（例如 StrictMode 下的双渲染）
    if (!conversationId || !initialMessage || processedInitialMessages.has(initialMessage) || isStreamingRef.current) return

    const timer = setTimeout(() => {
      isStreamingRef.current = true
      processedInitialMessages.add(initialMessage)
      void handleSendMessage(initialMessage)
    }, 100)

    return () => clearTimeout(timer)
  }, [conversationId, initialMessage, handleSendMessage])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  const handleRetry = useCallback(
    async (content: string) => {
      await handleSendMessage(content)
    },
    [handleSendMessage],
  )

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
        toast.success(t('chat.messages.copied'))
      } catch (error) {
        console.error('Failed to copy message:', error)
        toast.error(t('chat.messages.copyFailedRetry'))
      }
    },
    handleShareMessage: async (message: Message) => {
      if (!message?.content) return
      const sharePayload = { title: t('chat.messages.shareTitle'), text: message.content }
      try {
        if ('share' in navigator && typeof navigator.share === 'function') {
          await navigator.share(sharePayload)
        } else {
          await copyTextToClipboard(message.content)
          toast.success(t('chat.messages.copiedForShare'))
        }
      } catch (error) {
        console.error('Failed to share message:', error)
        toast.error(t('chat.messages.shareFailedLater'))
      }
    },
  }
}
