'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { useParams } from 'next/navigation'

import { useEffect, useState } from 'react'
import { chatApi, messagesApi } from '@/lib/supabase/sdk'
import { ChatInputBox } from '../_components/chat-input-box'
import { ChatWelcomeHeader } from '../_components/chat-welcome-header'
import { MessageList } from './_components/message-list'

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

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

  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    try {
      // 添加用户消息到本地状态（临时显示）
      const userMessage: Message = {
        id: `temp-user-${Date.now()}`,
        conversation_id: conversationId,
        user_id: 'default-user',
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)

      // 调用 API 发送消息（多轮对话）
      await chatApi.sendMessage({
        conversationId,
        message: content.trim(),
      })

      // 重新加载消息列表，获取AI的回复
      const updatedMessages = await messagesApi.getByConversationId(conversationId)
      setMessages(updatedMessages)

      // 找到最新的 AI 消息并启用打字机效果
      const latestAiMessage = updatedMessages
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      if (latestAiMessage) {
        setStreamingMessageId(latestAiMessage.id)
        // 根据消息长度计算打字机效果持续时间，然后清除
        const typingDuration = latestAiMessage.content.length * 30 + 500
        setTimeout(() => {
          setStreamingMessageId(null)
        }, typingDuration)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // 移除临时消息
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')))
      // TODO: 显示错误提示
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载对话历史
  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) return

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
  }, [conversationId])

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
        <ChatInputBox onSend={handleSendMessage} />
      </div>
    </div>
  )
}
