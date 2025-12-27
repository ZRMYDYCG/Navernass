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
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [conversationTitle, setConversationTitle] = useState('Narraverse 对话')

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
    if (!conversationId || !initialMessage || isStreamingRef.current) return

    const timer = setTimeout(() => {
      isStreamingRef.current = true
      void handleSendMessage(initialMessage)
    }, 100)

    return () => clearTimeout(timer)
  }, [conversationId, initialMessage])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort()
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
              setConversationTitle('Narraverse 对话')
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

      toast.error('发送失败，请重试')
    }
  }, [conversationId, isLoading, loadConversationHistorySilently])

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
