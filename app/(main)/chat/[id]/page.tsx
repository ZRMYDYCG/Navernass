'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { Copy, Image as ImageIcon, Link2, X } from 'lucide-react'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
  const [isShareMode, setIsShareMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([])

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

  const handleCopyMessage = useCallback(async (message: Message) => {
    if (!message?.content) return

    try {
      await navigator.clipboard.writeText(message.content)
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
        await navigator.clipboard.writeText(message.content)
        toast.success('已复制消息内容，粘贴即可分享')
      }
    } catch (error) {
      console.error('Failed to share message:', error)
      toast.error('分享失败，请稍后再试')
    }
  }, [])

  const handleToggleShareMode = useCallback(() => {
    setIsShareMode((prev) => {
      if (prev) {
        setSelectedMessageIds([])
        return false
      }

      setSelectedMessageIds(messages.map(msg => msg.id))
      return true
    })
  }, [messages])

  const handleToggleSelectMessage = useCallback((messageId: string) => {
    setSelectedMessageIds((prev) => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId)
      }
      return [...prev, messageId]
    })
  }, [])

  const handleCancelShareMode = useCallback(() => {
    setIsShareMode(false)
    setSelectedMessageIds([])
  }, [])

  const handleCopySelectedText = useCallback(async () => {
    const selectedMessages = messages.filter(msg => selectedMessageIds.includes(msg.id))
    if (selectedMessages.length === 0) {
      toast.error('请先选择要复制的消息')
      return
    }

    const formatted = selectedMessages
      .map(msg => `${msg.role === 'user' ? '我' : 'AI'}：${msg.content}`)
      .join('\n\n')

    try {
      await navigator.clipboard.writeText(formatted)
      toast.success('对话文本已复制')
    } catch (error) {
      console.error('Failed to copy conversation:', error)
      toast.error('复制失败，请重试')
    }
  }, [messages, selectedMessageIds])

  const handleCopyConversationLink = useCallback(async () => {
    if (typeof window === 'undefined') return

    const shareUrl = `${window.location.origin}/chat/${conversationId}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('链接已复制')
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('复制链接失败，请重试')
    }
  }, [conversationId])

  const handleGenerateImage = useCallback(() => {
    toast('稍等一下，图片生成功能正在开发中～')
  }, [])

  useEffect(() => {
    if (!isShareMode) return

    setSelectedMessageIds((prev) => {
      const messageIdSet = new Set(messages.map(msg => msg.id))
      return prev.filter(id => messageIdSet.has(id))
    })
  }, [isShareMode, messages])

  return (
    <div className="flex flex-col h-full">
      <ChatWelcomeHeader
        onShareConversation={handleToggleShareMode}
        isShareMode={isShareMode}
      />

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          streamingMessageId={streamingMessageId}
          onCopyMessage={handleCopyMessage}
          onShareMessage={handleShareMessage}
          isShareMode={isShareMode}
          selectedMessageIds={selectedMessageIds}
          onToggleSelectMessage={handleToggleSelectMessage}
        />
      </div>

      {/* 输入框区域 */}
      {isShareMode
        ? (
            <ShareActionBar
              selectedCount={selectedMessageIds.length}
              onCancel={handleCancelShareMode}
              onCopyText={handleCopySelectedText}
              onCopyLink={handleCopyConversationLink}
              onGenerateImage={handleGenerateImage}
            />
          )
        : (
            <div className="mb-3">
              <ChatInputBox
                onSend={handleSendMessage}
                disabled={isLoading}
              />
            </div>
          )}
    </div>
  )
}

interface ShareActionBarProps {
  selectedCount: number
  onCancel: () => void
  onCopyText: () => void
  onCopyLink: () => void
  onGenerateImage: () => void
}

function ShareActionBar({
  selectedCount,
  onCancel,
  onCopyText,
  onCopyLink,
  onGenerateImage,
}: ShareActionBarProps) {
  return (
    <div className="border-t bg-background px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            已选中
            {selectedCount}
            {' '}
            条对话
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
            <span>取消</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3"
            onClick={onCopyText}
          >
            <Copy className="w-4 h-4" />
            <span>复制文本</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3"
            onClick={onCopyLink}
          >
            <Link2 className="w-4 h-4" />
            <span>复制链接</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3"
            onClick={onGenerateImage}
          >
            <ImageIcon className="w-4 h-4" />
            <span>生成图片</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
