'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { useParams, useRouter } from 'next/navigation'

import { useEffect, useRef, useState } from 'react'
import { chatApi, messagesApi } from '@/lib/supabase/sdk'
import { ChatInputBox } from '../_components/chat-input-box'
import { ChatWelcomeHeader } from '../_components/chat-welcome-header'
import { MessageList } from './_components/message-list'

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const isNewConversation = conversationId === 'new'

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [realConversationId, setRealConversationId] = useState<string>(
    isNewConversation ? '' : conversationId,
  )

  // 使用 ref 避免重复处理
  const isProcessingRef = useRef(false)
  const hasInitializedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 加载对话历史
  const loadConversationHistory = async (id: string) => {
    try {
      const historyMessages = await messagesApi.getByConversationId(id)
      setMessages(historyMessages)
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      setMessages([])
    }
  }

  // 处理用户发送消息
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || isProcessingRef.current) return

    // 如果是新对话且没有真实ID，不允许发送
    if (isNewConversation && !realConversationId) {
      console.warn('Cannot send message: conversation not yet created')
      return
    }

    const convId = realConversationId
    if (!convId) return

    // 设置处理标志
    isProcessingRef.current = true
    setIsLoading(true)

    // 取消之前的请求（如果有）
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    let aiMessageId: string | null = null
    let accumulatedContent = ''

    // 添加用户消息到UI
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: convId,
      user_id: 'default-user',
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      await chatApi.sendMessageStream(
        {
          conversationId: convId,
          message: content.trim(),
        },
        {
          onContent: (chunk) => {
            accumulatedContent += chunk

            if (!aiMessageId) {
              const tempAiMessage: Message = {
                id: `temp-ai-${Date.now()}`,
                conversation_id: convId,
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
          },
        },
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsLoading(false)
      setStreamingMessageId(null)
      isProcessingRef.current = false
      abortControllerRef.current = null
    }
  }

  // 处理新对话的初始化
  useEffect(() => {
    if (!isNewConversation || hasInitializedRef.current) return

    hasInitializedRef.current = true

    const initNewConversation = async () => {
      const initialMessage = sessionStorage.getItem('newChatMessage')
      if (!initialMessage) {
        // 没有初始消息，跳转回主页
        router.replace('/chat')
        return
      }

      // 清除 sessionStorage
      sessionStorage.removeItem('newChatMessage')

      // 设置处理标志
      isProcessingRef.current = true
      setIsLoading(true)

      let aiMessageId: string | null = null
      let accumulatedContent = ''
      let newConvId: string | null = null

      // 添加用户消息到UI
      const tempUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        conversation_id: 'temp',
        user_id: 'default-user',
        role: 'user',
        content: initialMessage,
        created_at: new Date().toISOString(),
      }
      setMessages([tempUserMessage])

      try {
        await chatApi.sendMessageStream(
          {
            message: initialMessage,
          },
          {
            onConversationId: (id) => {
              newConvId = id
              setRealConversationId(id)
            },
            onContent: (chunk) => {
              accumulatedContent += chunk

              if (!aiMessageId) {
                const tempAiMessage: Message = {
                  id: `temp-ai-${Date.now()}`,
                  conversation_id: 'temp',
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

              // 流式完成后再更新 URL
              if (newConvId) {
                // 使用 queueMicrotask 确保状态完全更新后再导航
                queueMicrotask(() => {
                  router.replace(`/chat/${newConvId}`, { scroll: false })
                })
              }
            },
            onError: (error) => {
              console.error('Streaming error:', error)
              setIsLoading(false)
              setStreamingMessageId(null)
              isProcessingRef.current = false
              // 发生错误时跳转回主页
              router.replace('/chat')
            },
          },
        )
      } catch (error) {
        console.error('Failed to start new conversation:', error)
        setIsLoading(false)
        isProcessingRef.current = false
        // 发生错误时跳转回主页
        router.replace('/chat')
      }
    }

    initNewConversation()
  }, [isNewConversation, router])

  // 加载现有对话的历史记录
  useEffect(() => {
    // 如果是新对话、没有conversationId、已经初始化过、或者已经有消息了，就不加载
    if (isNewConversation || !conversationId || hasInitializedRef.current || messages.length > 0) return

    hasInitializedRef.current = true

    const loadConversation = async () => {
      try {
        setIsLoading(true)
        await loadConversationHistory(conversationId)
      } catch (error) {
        console.error('Failed to load conversation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversation()
  }, [conversationId, isNewConversation, messages.length])

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <ChatWelcomeHeader />

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          streamingMessageId={streamingMessageId}
        />
      </div>

      {/* 输入框区域 */}
      <div className="mb-3">
        <ChatInputBox
          onSend={handleSendMessage}
          disabled={isLoading || (isNewConversation && !realConversationId)}
        />
      </div>
    </div>
  )
}
