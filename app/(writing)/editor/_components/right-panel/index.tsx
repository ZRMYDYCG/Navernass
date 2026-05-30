'use client'

import type { AiMode, AiModel } from './types'
import type { Chapter, NovelConversation, NovelMessage } from '@/lib/supabase/sdk'
import type { UIMessage } from 'ai'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/hooks/use-i18n'
import { novelConversationsApi } from '@/lib/supabase/sdk'
import { AtButton } from './at-button'
import { ChapterSelector } from './chapter-selector'
import { ConversationHistory } from './conversation-history'
import { EmptyState } from './empty-state'
import { Header } from './header'
import { InputArea } from './input-area'
import { MessageList } from './message-list'
import { ModeSelector } from './mode-selector'
import { ModelSelector } from './model-selector'
import { RecentConversations } from './recent-conversations'
import { SelectedChapters } from './selected-chapters'
import { SendButton } from './send-button'

/**
 * 将 Supabase 中的 NovelMessage 转为 AI SDK 的 UIMessage（用于回填历史）。
 * thinking 以 reasoning part 表达，content 以 text part 表达。
 */
function toUIMessages(messages: NovelMessage[]): UIMessage[] {
  return messages.map((m) => {
    const parts: UIMessage['parts'] = []
    if (m.thinking) {
      parts.push({ type: 'reasoning', text: m.thinking, state: 'done' } as UIMessage['parts'][number])
    }
    parts.push({ type: 'text', text: m.content, state: 'done' } as UIMessage['parts'][number])
    return {
      id: m.id,
      role: m.role as 'user' | 'assistant' | 'system',
      parts,
    } as UIMessage
  })
}

export default function RightPanel() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const novelId = searchParams.get('id') || ''

  const [conversations, setConversations] = useState<NovelConversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [mode, setMode] = useState<AiMode>('ask')
  const [model, setModel] = useState<AiModel>('MiniMax-M2.7')
  const [input, setInput] = useState('')
  const [selectedChapters, setSelectedChapters] = useState<Chapter[]>([])
  const [showChapterSelector, setShowChapterSelector] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  const conversationIdRef = useRef<string | null>(null)
  conversationIdRef.current = currentConversationId
  const skipLoadOnceRef = useRef(false)
  const setConversationIdFromHeaderRef = useRef<(id: string) => void>(() => {})

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/editor/novel-conversations/stream',
        fetch: async (input, init) => {
          const res = await fetch(input, init)
          const id = res.headers.get('X-Conversation-Id')
          if (id) setConversationIdFromHeaderRef.current(id)
          return res
        },
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages,
            novelId,
            conversationId: conversationIdRef.current || undefined,
            selectedChapterIds: selectedChapters.map(c => c.id),
            mode,
            model,
          },
        }),
      }),
    [novelId, selectedChapters, mode, model],
  )

  setConversationIdFromHeaderRef.current = (id: string) => {
    if (conversationIdRef.current !== id) {
      skipLoadOnceRef.current = true
      setCurrentConversationId(id)
    }
  }

  const { messages, sendMessage, setMessages, status, stop, error } = useChat({
    transport,
    onFinish: () => {
      void loadConversations()
    },
    onError: (err) => {
      console.error('useChat error:', err)
    },
  })

  const isLoading = status === 'submitted' || status === 'streaming'
  const streamingMessageId = useMemo(() => {
    if (status !== 'streaming') return null
    const last = messages[messages.length - 1]
    return last?.role === 'assistant' ? last.id : null
  }, [status, messages])

  const hasMessages = messages.length > 0

  const loadConversations = useCallback(async () => {
    if (!novelId) return
    try {
      const data = await novelConversationsApi.getByNovelId(novelId)
      setConversations(data)
    } catch (e) {
      console.error('Failed to load conversations:', e)
    }
  }, [novelId])

  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true)
    try {
      const data = await novelConversationsApi.getMessages(conversationId)
      setMessages(toUIMessages(data))
    } catch (e) {
      console.error('Failed to load messages:', e)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }, [setMessages])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (event: Event) => {
      const text = (event as CustomEvent<{ text?: string }>).detail?.text
      if (!text) return
      setInput(prev => (prev.trim() ? `${prev.trim()}\n\n${text}` : text))
    }
    window.addEventListener('novel-ai-insert-from-editor', handler)
    return () => window.removeEventListener('novel-ai-insert-from-editor', handler)
  }, [])

  useEffect(() => {
    if (!novelId) return
    void loadConversations()
  }, [novelId, loadConversations])

  useEffect(() => {
    if (skipLoadOnceRef.current) {
      skipLoadOnceRef.current = false
      return
    }
    if (currentConversationId) {
      void loadMessages(currentConversationId)
    } else {
      setMessages([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading || !novelId) return
    setInput('')
    try {
      await sendMessage({ text })
    } catch (e) {
      console.error('Failed to send message:', e)
    }
  }

  const handleAtClick = () => {
    if (!novelId) return
    setShowChapterSelector(true)
  }

  const handleChapterSelectionChange = (chapters: Chapter[]) => {
    setSelectedChapters(chapters)
  }

  const handleRemoveChapter = (chapterId: string) => {
    setSelectedChapters(prev => prev.filter(c => c.id !== chapterId))
  }

  const handleNewChat = () => {
    if (isLoading) stop()
    setCurrentConversationId(null)
    setMessages([])
    setSelectedChapters([])
    setInput('')
  }

  const handleShowHistory = () => setShowHistory(true)

  const handleSelectConversation = async (conversation: NovelConversation) => {
    if (isLoading) stop()
    setCurrentConversationId(conversation.id)
    setShowHistory(false)
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await novelConversationsApi.delete(conversationId)
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null)
        setMessages([])
      }
      await loadConversations()
    } catch (e) {
      console.error('Failed to delete conversation:', e)
    }
  }

  const handlePinConversation = async (conversationId: string, isPinned: boolean) => {
    try {
      await novelConversationsApi.update(conversationId, { is_pinned: isPinned })
      await loadConversations()
    } catch (e) {
      console.error('Failed to pin conversation:', e)
    }
  }

  return (
    <div className="h-full w-full bg-transparent relative">
      <div className="h-full flex flex-col border-border bg-background">
        <Header onNewChat={handleNewChat} onShowHistory={handleShowHistory} />

        <div className="flex-1 min-h-0 overflow-hidden px-2 py-2 relative">
          {isLoadingMessages
            ? (
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  <Spinner className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('editor.rightPanel.loadingConversation')}</span>
                </div>
              )
            : !hasMessages
                ? (
                    <EmptyState />
                  )
                : (
                    <MessageList
                      messages={messages}
                      streamingMessageId={streamingMessageId}
                      isLoading={isLoading && !streamingMessageId}
                    />
                  )}
          {error && (
            <div className="absolute bottom-2 left-2 right-2 text-[11px] text-destructive bg-destructive/10 border border-destructive/30 rounded px-2 py-1">
              {error.message}
            </div>
          )}
        </div>

        <div className="px-3 py-2 space-y-2 bg-background rounded-b-lg z-10">
          {!hasMessages && !isLoadingMessages && (
            <RecentConversations
              conversations={conversations}
              onSelect={handleSelectConversation}
            />
          )}
          {selectedChapters.length > 0 && (
            <SelectedChapters chapters={selectedChapters} onRemove={handleRemoveChapter} />
          )}

          <div className="flex gap-2 items-end">
            <InputArea
              value={input}
              onChange={setInput}
              onSend={handleSend}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <AtButton onClick={handleAtClick} />
            <ModeSelector value={mode} onChange={setMode} />
            <ModelSelector value={model} onChange={setModel} />
            <SendButton onClick={handleSend} disabled={!input.trim() || isLoading} />
          </div>
        </div>

        {showChapterSelector && novelId && (
          <ChapterSelector
            novelId={novelId}
            selectedChapters={selectedChapters}
            onSelectionChange={handleChapterSelectionChange}
            onClose={() => setShowChapterSelector(false)}
          />
        )}

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
    </div>
  )
}
