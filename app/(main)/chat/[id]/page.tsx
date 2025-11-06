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

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

  // 使用 ref 避免重复处理
  const isProcessingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  // 记录是否已初始化
  const hasInitializedRef = useRef(false)

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
    if (!conversationId) return

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
      conversation_id: conversationId,
      user_id: 'default-user',
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      await chatApi.sendMessageStream(
        {
          conversationId,
          message: content.trim(),
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

  // 统一的初始化逻辑
  useEffect(() => {
    if (hasInitializedRef.current || !conversationId) return
    hasInitializedRef.current = true

    const initialize = async () => {
      // 检查是否是从新建对话页面跳转过来的
      const initialMessage = sessionStorage.getItem('newChatMessage')
      const storedConvId = sessionStorage.getItem('newConversationId')

      if (initialMessage && storedConvId === conversationId) {
        // 从新建对话页面跳转过来，需要继续流式输出
        sessionStorage.removeItem('newChatMessage')
        sessionStorage.removeItem('newConversationId')

        isProcessingRef.current = true
        setIsLoading(true)

        let aiMessageId: string | null = null
        let accumulatedContent = ''

        // 添加用户消息到UI
        const tempUserMessage: Message = {
          id: `temp-user-${Date.now()}`,
          conversation_id: conversationId,
          user_id: 'default-user',
          role: 'user',
          content: initialMessage,
          created_at: new Date().toISOString(),
        }
        setMessages([tempUserMessage])

        try {
          await chatApi.sendMessageStream(
            {
              conversationId,
              message: initialMessage,
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
                router.replace('/chat')
              },
            },
          )
        } catch (error) {
          console.error('Failed to continue conversation:', error)
          setIsLoading(false)
          isProcessingRef.current = false
          router.replace('/chat')
        }
      } else {
        // 正常加载现有对话的历史记录
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
  }, [conversationId, router])

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
          disabled={isLoading}
        />
      </div>
    </div>
  )
}
