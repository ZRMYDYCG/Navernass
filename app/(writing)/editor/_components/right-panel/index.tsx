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
import { ChapterMentionPicker } from './chapter-selector'
import { ConversationHistory } from './conversation-history'
import { EmptyState } from './empty-state'
import { Header } from './header'
import { MessageList } from './message-list'
import { ModeSelector } from './mode-selector'
import { ModelSelector } from './model-selector'
import { AiChatInput } from '@/components/buss'
import { ChatActionsProvider } from './parts/chat-actions-context'
import type { FormSubmitPayload } from './parts/chat-actions-context'
import { MessageErrorFallback } from './message-error-fallback'
import { MessageErrorBoundary } from './message-error-boundary'
import { RecentConversations } from './recent-conversations'
import { SelectedChapters } from './selected-chapters'

/**
 * 把可能是字符串（旧 supabase 配置）或数组（新格式）的 parts 字段统一成数组。
 * 任何失败都返回 null，让上层 fallback 到 content+thinking。
 */
function safeParseParts(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

/**
 * 清洗历史 parts：丢掉处于"流式中途"或缺少必需字段的 part。
 *
 * 场景：上一次 stream 被网络断开/服务重启，半成品 tool part（state=input-streaming
 * 或没有 output 的 output-available）被持久化。回填时 ai-sdk 会校验 part 形态，
 * 不丢弃就直接抛 "Invalid part" 让整条消息渲染失败。
 */
function sanitizeParts(parts: unknown[]): unknown[] {
  return parts.filter((p: any) => {
    if (!p || typeof p !== 'object' || typeof p.type !== 'string') return false
    if (p.type.startsWith('tool-')) {
      // 只保留有 state 且至少进入 input-available 的 tool part
      if (p.state === 'input-streaming') return false
      // output-available 但 output 是 null/undefined 的也跳过
      if (p.state === 'output-available' && p.output == null) return false
    }
    return true
  })
}

/**
 * 将 Supabase 中的 NovelMessage 转为 AI SDK 的 UIMessage（用于回填历史）。
 *
 * 优先级：
 *   1. m.parts 存在且是数组 → 直接用（tool / ask_user / reasoning 都能完整还原）
 *   2. 否则按 thinking + content 兜底重建
 *
 * 即使某一条转换抛错，也跳过这一条而非让整个列表挂掉。
 */
function toUIMessages(messages: NovelMessage[]): UIMessage[] {
  const out: UIMessage[] = []
  for (const m of messages) {
    try {
      const parts = safeParseParts(m.parts)
      if (parts && parts.length > 0) {
        const cleaned = sanitizeParts(parts)
        if (cleaned.length > 0) {
          out.push({
            id: m.id,
            role: m.role as 'user' | 'assistant' | 'system',
            parts: cleaned as UIMessage['parts'],
          } as UIMessage)
          continue
        }
      }

      const fallback: UIMessage['parts'] = []
      if (m.thinking) {
        fallback.push({ type: 'reasoning', text: m.thinking, state: 'done' } as UIMessage['parts'][number])
      }
      fallback.push({ type: 'text', text: m.content || '', state: 'done' } as UIMessage['parts'][number])
      out.push({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        parts: fallback,
      } as UIMessage)
    } catch (err) {
      console.warn('[toUIMessages] skipped one message due to:', err, m)
    }
  }
  return out
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
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [loadMessagesError, setLoadMessagesError] = useState<string | null>(null)
  const [submittedFormKeys, setSubmittedFormKeys] = useState<Set<string>>(() => new Set())

  const conversationIdRef = useRef<string | null>(null)
  conversationIdRef.current = currentConversationId
  const skipLoadOnceRef = useRef(false)
  const setConversationIdFromHeaderRef = useRef<(id: string) => void>(() => {})
  const novelIdRef = useRef(novelId)
  novelIdRef.current = novelId
  const modeRef = useRef(mode)
  modeRef.current = mode
  const modelRef = useRef(model)
  modelRef.current = model
  const selectedChaptersRef = useRef(selectedChapters)
  selectedChaptersRef.current = selectedChapters

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
            novelId: novelIdRef.current,
            conversationId: conversationIdRef.current || undefined,
            selectedChapterIds: selectedChaptersRef.current.map(c => c.id),
            mode: modeRef.current,
            model: modelRef.current,
          },
        }),
      }),
    [],
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
    setLoadMessagesError(null)
    try {
      const data = await novelConversationsApi.getMessages(conversationId)
      setMessages(toUIMessages(data))
    } catch (e) {
      console.error('Failed to load messages:', e)
      setMessages([])
      const msg = e instanceof Error ? e.message : t('editor.rightPanel.loadMessagesFailed')
      // 网络超时、500 等错误以前会被吞掉显示成空对话——现在显式呈现
      setLoadMessagesError(msg)
    } finally {
      setIsLoadingMessages(false)
    }
  }, [setMessages, t])

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

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim()
    if (!text || isLoading || !novelId) return
    setInput('')
    try {
      await sendMessage({ text })
    } catch (e) {
      console.error('Failed to send message:', e)
    }
  }

  const submitFormResponse = useCallback(async (payload: FormSubmitPayload) => {
    if (isLoading || submittedFormKeys.has(payload.formKey)) return
    const header = payload.title || t('editor.rightPanel.askUserForm.replyHeader')
    const lines = Object.entries(payload.values)
      .filter(([, v]) => v.trim())
      .map(([id, v]) => `${payload.labels[id] || id}: ${v}`)
      .join('\n')
    if (!lines) return
    setSubmittedFormKeys(prev => new Set(prev).add(payload.formKey))
    try {
      await sendMessage({ text: `[${header}]\n${lines}` })
    } catch (e) {
      setSubmittedFormKeys((prev) => {
        const next = new Set(prev)
        next.delete(payload.formKey)
        return next
      })
      console.error('Failed to submit form:', e)
    }
  }, [isLoading, submittedFormKeys, sendMessage, t])

  const chatActions = useMemo(() => ({
    submitFormResponse,
    isFormSubmitted: (formKey: string) => submittedFormKeys.has(formKey),
    isChatLoading: isLoading,
  }), [submitFormResponse, submittedFormKeys, isLoading])

  const handleRemoveChapter = (chapterId: string) => {
    setSelectedChapters(prev => prev.filter(c => c.id !== chapterId))
  }

  const handleNewChat = () => {
    if (isLoading) stop()
    setCurrentConversationId(null)
    setMessages([])
    setSelectedChapters([])
    setInput('')
    setSubmittedFormKeys(new Set())
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
            : loadMessagesError
              ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 px-4">
                    <div className="text-[12px] text-destructive font-medium">{t('editor.rightPanel.loadMessagesFailed')}</div>
                    <div className="text-[11px] text-muted-foreground text-center max-w-xs break-all">
                      {loadMessagesError}
                    </div>
                    <button
                      type="button"
                      onClick={() => currentConversationId && loadMessages(currentConversationId)}
                      className="text-[11px] underline text-foreground hover:opacity-80"
                    >
                      {t('editor.rightPanel.retry')}
                    </button>
                  </div>
                )
              : !hasMessages
                  ? (
                      <EmptyState mode={mode} />
                    )
                  : (
                      <ChatActionsProvider value={chatActions}>
                        <MessageErrorBoundary
                          fallback={(error, retry) => (
                            <MessageErrorFallback error={error} onRetry={retry} />
                          )}
                        >
                          <MessageList
                            messages={messages}
                            streamingMessageId={streamingMessageId}
                            isLoading={isLoading && !streamingMessageId}
                          />
                        </MessageErrorBoundary>
                      </ChatActionsProvider>
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
          <AiChatInput
            value={input}
            onChange={setInput}
            onSend={text => handleSend(text)}
            placeholder={t(`editor.rightPanel.mode.placeholder.${mode}`)}
            disabled={isLoading || !novelId}
            isSending={isLoading}
            variant="compact"
            references={
              selectedChapters.length > 0
                ? (
                    <SelectedChapters
                      chapters={selectedChapters}
                      onRemove={handleRemoveChapter}
                    />
                  )
                : undefined
            }
            toolbar={(
              <>
                <ChapterMentionPicker
                  selectedChapters={selectedChapters}
                  onSelectionChange={setSelectedChapters}
                  disabled={!novelId}
                />
                <ModeSelector value={mode} onChange={setMode} />
                <ModelSelector value={model} onChange={setModel} />
              </>
            )}
          />
        </div>

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
