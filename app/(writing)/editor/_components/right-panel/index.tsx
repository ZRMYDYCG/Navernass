'use client'

import type { AiMode, AiModel } from './types'
import type { Chapter, NovelConversation, NovelMessage } from '@/lib/supabase/sdk'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { novelConversationsApi } from '@/lib/supabase/sdk'
import { AtButton } from './at-button'
import { ChapterSelector } from './chapter-selector'
import { ConversationHistory } from './conversation-history'
import { EmptyState } from './empty-state'
import { Header } from './header'
import { InputArea } from './input-area'
import { MessageList } from './message-list'
import { MessageListSkeleton } from './message-list-skeleton'
import { ModeSelector } from './mode-selector'
import { ModelSelector } from './model-selector'
import { SelectedChapters } from './selected-chapters'
import { SendButton } from './send-button'

export default function RightPanel() {
  const searchParams = useSearchParams()
  const novelId = searchParams.get('id') || ''

  const [messages, setMessages] = useState<NovelMessage[]>([])
  const [conversations, setConversations] = useState<NovelConversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [mode, setMode] = useState<AiMode>('ask')
  const [model, setModel] = useState<AiModel>('Qwen/Qwen2.5-7B-Instruct')
  const [input, setInput] = useState('')
  const [selectedChapters, setSelectedChapters] = useState<Chapter[]>([])
  const [showChapterSelector, setShowChapterSelector] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

  const isProcessingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isStreamingRef = useRef(false)

  // 加载会话列表
  const loadConversations = useCallback(async () => {
    if (!novelId) return
    try {
      const data = await novelConversationsApi.getByNovelId(novelId)
      setConversations(data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }, [novelId])

  // 加载会话消息（显示骨架屏）
  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true)
    try {
      const data = await novelConversationsApi.getMessages(conversationId)
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  // 静默加载会话消息（不显示骨架屏，用于流式传输完成后更新数据）
  const loadMessagesSilently = useCallback(async (conversationId: string) => {
    try {
      const data = await novelConversationsApi.getMessages(conversationId)
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages silently:', error)
    }
  }, [])

  // 初始化：加载会话列表
  useEffect(() => {
    if (!novelId) return
    let cancelled = false
    void (async () => {
      try {
        const data = await novelConversationsApi.getByNovelId(novelId)
        if (!cancelled) {
          setConversations(data)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load conversations:', error)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [novelId])

  // 当选择会话时，加载消息
  useEffect(() => {
    if (currentConversationId) {
      // 如果正在流式传输，不加载消息（避免显示骨架屏）
      if (!isStreamingRef.current) {
        void loadMessages(currentConversationId)
      }
    } else {
      const timer = setTimeout(() => {
        setMessages([])
        setIsLoadingMessages(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [currentConversationId, loadMessages])

  const handleSend = async () => {
    if (!input.trim() || isLoading || isProcessingRef.current || !novelId) return

    isProcessingRef.current = true
    setIsLoading(true)
    isStreamingRef.current = true // 标记开始流式传输

    // 取消之前的请求（如果有）
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const messageContent = input.trim()
    setInput('')

    // 添加用户消息到UI
    const tempUserMessage: NovelMessage = {
      id: `temp-user-${Date.now()}`,
      conversation_id: currentConversationId || '',
      novel_id: novelId,
      user_id: 'default-user',
      role: 'user',
      content: messageContent,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMessage])

    let aiMessageId: string | null = null
    let accumulatedContent = ''
    let newConversationId = currentConversationId

    try {
      await novelConversationsApi.sendMessageStream(
        {
          novelId,
          conversationId: currentConversationId || undefined,
          message: messageContent,
          selectedChapterIds: selectedChapters.map(c => c.id),
          mode,
          model,
        },
        {
          onConversationId: (id) => {
            newConversationId = id
            setCurrentConversationId(id)
            // 如果创建了新会话，重新加载会话列表
            if (!currentConversationId) {
              loadConversations()
            }
          },
          onUserMessageId: (id) => {
            // 更新临时用户消息的ID
            setMessages(prev =>
              prev.map(msg =>
                msg.id === tempUserMessage.id ? { ...msg, id } : msg,
              ),
            )
          },
          onContent: (chunk) => {
            accumulatedContent += chunk

            if (!aiMessageId) {
              const tempAiMessage: NovelMessage = {
                id: `temp-ai-${Date.now()}`,
                conversation_id: newConversationId || '',
                novel_id: novelId,
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
            isStreamingRef.current = false // 标记流式传输结束
            if (newConversationId) {
              await loadMessagesSilently(newConversationId)
            }
            // 重新加载会话列表以更新更新时间
            await loadConversations()
          },
          onError: (error) => {
            console.error('Streaming error:', error)
            setIsLoading(false)
            setStreamingMessageId(null)
            isProcessingRef.current = false
            abortControllerRef.current = null
            isStreamingRef.current = false // 标记流式传输结束
            // 移除临时消息
            setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id && msg.id !== aiMessageId))
          },
        },
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsLoading(false)
      setStreamingMessageId(null)
      isProcessingRef.current = false
      abortControllerRef.current = null
      isStreamingRef.current = false // 标记流式传输结束
      // 移除临时消息
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id && msg.id !== aiMessageId))
    }
  }

  const handleAtClick = () => {
    if (!novelId) {
      console.warn('缺少小说ID')
      return
    }
    setShowChapterSelector(true)
  }

  const handleChapterSelectionChange = (chapters: Chapter[]) => {
    setSelectedChapters(chapters)
  }

  const handleRemoveChapter = (chapterId: string) => {
    setSelectedChapters(prev => prev.filter(c => c.id !== chapterId))
  }

  const handleNewChat = () => {
    isStreamingRef.current = false // 重置流式传输标记
    setCurrentConversationId(null)
    setMessages([])
    setSelectedChapters([])
    setInput('')
  }

  const handleShowHistory = () => {
    setShowHistory(true)
  }

  const handleSelectConversation = async (conversation: NovelConversation) => {
    isStreamingRef.current = false // 重置流式传输标记，确保能正常加载消息
    setCurrentConversationId(conversation.id)
    setShowHistory(false)
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await novelConversationsApi.delete(conversationId)
      // 如果删除的是当前会话，清空当前会话
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null)
        setMessages([])
      }
      // 重新加载会话列表
      await loadConversations()
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  const handlePinConversation = async (conversationId: string, isPinned: boolean) => {
    try {
      await novelConversationsApi.update(conversationId, { is_pinned: isPinned })
      // 重新加载会话列表
      await loadConversations()
    } catch (error) {
      console.error('Failed to pin conversation:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-zinc-800 border-l border-gray-200 dark:border-gray-700">
      {/* 顶部标题 */}
      <Header onNewChat={handleNewChat} onShowHistory={handleShowHistory} />

      {/* 对话区域 */}
      <div className="flex-1 overflow-hidden px-2 py-2">
        {isLoadingMessages
          ? (
              <MessageListSkeleton />
            )
          : messages.length === 0
            ? (
                <EmptyState />
              )
            : (
                <MessageList messages={messages} streamingMessageId={streamingMessageId} />
              )}
      </div>

      {/* 输入区域 */}
      <div className="px-2 py-1.5 space-y-1.5">
        {/* 选中的章节标签 */}
        {selectedChapters.length > 0 && (
          <SelectedChapters chapters={selectedChapters} onRemove={handleRemoveChapter} />
        )}

        <div className="flex gap-1.5 items-end">
          <InputArea
            value={input}
            onChange={setInput}
            onSend={handleSend}
          />
        </div>

        {/* 工具栏：@ 按钮 + 模式切换 + 模型选择 + 发送按钮 */}
        <div className="flex items-center gap-1.5">
          <AtButton onClick={handleAtClick} />
          <ModeSelector value={mode} onChange={setMode} />
          <ModelSelector value={model} onChange={setModel} />
          <SendButton onClick={handleSend} disabled={!input.trim() || isLoading} />
        </div>
      </div>

      {/* 章节选择器 */}
      {showChapterSelector && novelId && (
        <ChapterSelector
          novelId={novelId}
          selectedChapters={selectedChapters}
          onSelectionChange={handleChapterSelectionChange}
          onClose={() => setShowChapterSelector(false)}
        />
      )}

      {/* 历史对话 */}
      {showHistory && (
        <ConversationHistory
          conversations={conversations}
          currentConversationId={currentConversationId || undefined}
          onSelect={handleSelectConversation}
          onDelete={handleDeleteConversation}
          onPin={handlePinConversation}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}
