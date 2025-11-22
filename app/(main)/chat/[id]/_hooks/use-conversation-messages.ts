'use client'

import type { Message } from '@/lib/supabase/sdk/types'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { toast } from 'sonner'

import { chatApi, conversationsApi, messagesApi } from '@/lib/supabase/sdk'
import { copyTextToClipboard } from '@/lib/utils'

export function useConversationMessages(conversationId: string) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [conversationTitle, setConversationTitle] = useState('Narraverse 对话')

  const isProcessingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const hasInitializedRef = useRef(false)

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

  const sendMessageStream = useCallback(async (content: string, isInitialMessage = false) => {
    let aiMessageId: string | null = null
    let accumulatedContent = ''

    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      user_id: 'default-user',
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }

    if (isInitialMessage) {
      setMessages([tempUserMessage])
    } else {
      setMessages(prev => [...prev, tempUserMessage])
    }

    try {
      await chatApi.sendMessageStream(
        {
          conversationId,
          message: content,
        },
        {
          onContent: (chunk) => {
            accumulatedContent += chunk

            if (!aiMessageId) {
              const tempAiMessage: Message = {
                id: `temp-ai-${Date.now()}`,
                conversation_id: conversationId,
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
          },
          onError: (error) => {
            console.error('Streaming error:', error)
            setIsLoading(false)
            setStreamingMessageId(null)
            isProcessingRef.current = false
            abortControllerRef.current = null
            if (isInitialMessage) {
              router.replace('/chat')
            }
          },
        },
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsLoading(false)
      setStreamingMessageId(null)
      isProcessingRef.current = false
      abortControllerRef.current = null
      if (isInitialMessage) {
        router.replace('/chat')
      }
    }
  }, [conversationId, router])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || isProcessingRef.current) return
    if (!conversationId) return

    isProcessingRef.current = true
    setIsLoading(true)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    await sendMessageStream(content.trim())
  }, [conversationId, isLoading, sendMessageStream])

  const handleCopyMessage = useCallback(async (message: Message) => {
    if (!message?.content) return

    try {
      await copyTextToClipboard(message.content)
      toast.success('消息内容已复制')
    } catch (error) {
      console.error('Failed to copy message:', error)
      toast.error('复制失败，请重试')
    }
  }, [])

  const handleShareMessage = useCallback(async (message: Message) => {
    if (!message?.content) return

    const sharePayload = {
      title: '来自 Narraverse 的聊天消息',
      text: message.content,
    }

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
  }, [])

  useEffect(() => {
    if (hasInitializedRef.current || !conversationId) return
    hasInitializedRef.current = true

    const initialize = async () => {
      const initialMessage = sessionStorage.getItem('newChatMessage')
      const storedConvId = sessionStorage.getItem('newConversationId')

      if (initialMessage && storedConvId === conversationId) {
        sessionStorage.removeItem('newChatMessage')
        sessionStorage.removeItem('newConversationId')

        isProcessingRef.current = true
        setIsLoading(true)

        await sendMessageStream(initialMessage, true)
      } else {
        try {
          setIsLoading(true)
          await loadConversationHistory(conversationId)
        } catch (error) {
          console.error('Failed to load conversation:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    initialize()
  }, [conversationId, loadConversationHistory, sendMessageStream])

  useEffect(() => {
    const fetchTitle = async () => {
      if (!conversationId) return
      try {
        const conversation = await conversationsApi.getById(conversationId)
        if (conversation?.title) {
          setConversationTitle(conversation.title)
        }
      } catch (error) {
        console.error('Failed to load conversation title:', error)
      }
    }

    fetchTitle()
  }, [conversationId])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
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
    handleCopyMessage,
    handleShareMessage,
  }
}
