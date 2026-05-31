'use client'

import type { NovelConversation } from '@/lib/supabase/sdk'
import type { Chapter } from '@/lib/supabase/sdk'
import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { novelConversationsApi } from '@/lib/supabase/sdk'
import { useNovelChatStore, selectNovelChatUiSession } from '@/store'
import { useNovelChatContext } from './context'
import { useNovelChatRuntime } from './provider'
import { makeConversationKey } from './conversation-keys'
import { fromChapterRefs, resetDraftConversation, toChapterRefs } from './session-host'
import { messageHasVisibleContent } from '../parts/registry'
import { getNovelChatSessionBridge } from './chat-instances'

export function useNovelChat() {
  const searchParams = useSearchParams()
  const novelId = searchParams.get('id') || ''
  const { ensureSession } = useNovelChatContext()

  const setActiveNovelId = useNovelChatStore(s => s.setActiveNovelId)
  const patchUiSession = useNovelChatStore(s => s.patchUiSession)
  const uiSession = useNovelChatStore(s => selectNovelChatUiSession(s, novelId))

  const runtime = useNovelChatRuntime(novelId)

  useEffect(() => {
    if (novelId) ensureSession(novelId)
  }, [novelId, ensureSession])

  useEffect(() => {
    setActiveNovelId(novelId || null)
  }, [novelId, setActiveNovelId])

  const messages = runtime?.messages ?? []
  const status = runtime?.status ?? 'ready'
  const error = runtime?.error
  const sendMessage = runtime?.sendMessage
  const stop = runtime?.stop
  const loadMessages = runtime?.loadMessages
  const loadConversations = runtime?.loadConversations

  const isLoading = status === 'submitted' || status === 'streaming'
  const hasMessages = messages.length > 0

  const streamingMessageId = useMemo(() => {
    if (status !== 'submitted' && status !== 'streaming') return null
    const last = messages[messages.length - 1]
    return last?.role === 'assistant' ? last.id : null
  }, [status, messages])

  /** 请求已发出但助手侧尚无可见内容时保持「落笔中」 */
  const isAwaitingFirstToken = useMemo(() => {
    if (!isLoading) return false
    if (!streamingMessageId) return true
    const streamingMessage = messages.find(m => m.id === streamingMessageId)
    if (!streamingMessage) return true
    return !messageHasVisibleContent(streamingMessage, true)
  }, [isLoading, streamingMessageId, messages])

  const mode = uiSession?.mode ?? 'agent'
  const model = uiSession?.model ?? 'MiniMax-M2.7'
  const input = uiSession?.input ?? ''
  const selectedChapters = useMemo(
    () => toChapterRefs(uiSession?.selectedChapters ?? []),
    [uiSession?.selectedChapters],
  )
  const conversations = uiSession?.conversations ?? []
  const currentConversationId = uiSession?.currentConversationId ?? null
  const isDraftConversation = uiSession?.isDraftConversation ?? false
  const isLoadingMessages = uiSession?.isLoadingMessages ?? false
  const loadMessagesError = uiSession?.loadMessagesError ?? null
  const submittedFormKeys = useMemo(
    () => new Set(uiSession?.submittedFormKeys ?? []),
    [uiSession?.submittedFormKeys],
  )

  const setInput = useCallback((value: string | ((prev: string) => string)) => {
    if (!novelId) return
    patchUiSession(novelId, {
      input: typeof value === 'function' ? value(uiSession?.input ?? '') : value,
    })
  }, [novelId, patchUiSession, uiSession?.input])

  const setMode = useCallback((value: typeof mode) => {
    if (!novelId) return
    patchUiSession(novelId, { mode: value })
  }, [novelId, patchUiSession])

  const setModel = useCallback((value: typeof model) => {
    if (!novelId) return
    patchUiSession(novelId, { model: value })
  }, [novelId, patchUiSession])

  const setSelectedChapters = useCallback((chapters: Chapter[] | ((prev: Chapter[]) => Chapter[])) => {
    if (!novelId) return
    const current = toChapterRefs(uiSession?.selectedChapters ?? [])
    const next = typeof chapters === 'function' ? chapters(current) : chapters
    patchUiSession(novelId, { selectedChapters: fromChapterRefs(next) })
  }, [novelId, patchUiSession, uiSession?.selectedChapters])

  const addSubmittedFormKey = useCallback((formKey: string) => {
    if (!novelId) return
    const keys = uiSession?.submittedFormKeys ?? []
    if (keys.includes(formKey)) return
    patchUiSession(novelId, { submittedFormKeys: [...keys, formKey] })
  }, [novelId, patchUiSession, uiSession?.submittedFormKeys])

  const removeSubmittedFormKey = useCallback((formKey: string) => {
    if (!novelId) return
    patchUiSession(novelId, {
      submittedFormKeys: (uiSession?.submittedFormKeys ?? []).filter(k => k !== formKey),
    })
  }, [novelId, patchUiSession, uiSession?.submittedFormKeys])

  const handleSend = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? input).trim()
    if (!text || isLoading || !novelId || !sendMessage) return
    const conversationKey = makeConversationKey(novelId, currentConversationId, isDraftConversation)
    const bridge = getNovelChatSessionBridge(conversationKey)
    bridge.isDraftConversationRef.current = false
    patchUiSession(novelId, { input: '', isDraftConversation: false })
    try {
      await sendMessage({ text })
    } catch (e) {
      console.error('Failed to send message:', e)
    }
  }, [input, isLoading, novelId, sendMessage, patchUiSession, currentConversationId, isDraftConversation])

  const handleNewChat = useCallback(() => {
    if (!novelId) return
    resetDraftConversation(novelId)
    patchUiSession(novelId, {
      currentConversationId: null,
      isDraftConversation: true,
      input: '',
      selectedChapters: [],
      submittedFormKeys: [],
      isLoadingMessages: false,
      loadMessagesError: null,
    })
  }, [novelId, patchUiSession])

  const handleSelectConversation = useCallback((conversation: NovelConversation) => {
    if (!novelId) return
    if (conversation.id === currentConversationId) return
    patchUiSession(novelId, {
      currentConversationId: conversation.id,
      isDraftConversation: false,
      isLoadingMessages: false,
      loadMessagesError: null,
    })
  }, [novelId, currentConversationId, patchUiSession])

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    if (!novelId) return
    try {
      await novelConversationsApi.delete(conversationId)
      if (currentConversationId === conversationId) {
        patchUiSession(novelId, { currentConversationId: null })
        runtime?.setMessages([])
      }
      await loadConversations?.()
    } catch (e) {
      console.error('Failed to delete conversation:', e)
    }
  }, [novelId, currentConversationId, patchUiSession, runtime, loadConversations])

  return {
    novelId,
    messages,
    status,
    error,
    isLoading,
    hasMessages,
    streamingMessageId,
    isAwaitingFirstToken,
    mode,
    model,
    input,
    selectedChapters,
    conversations,
    currentConversationId,
    isDraftConversation,
    isLoadingMessages,
    loadMessagesError,
    submittedFormKeys,
    setInput,
    setMode,
    setModel,
    setSelectedChapters,
    addSubmittedFormKey,
    removeSubmittedFormKey,
    handleSend,
    handleNewChat,
    handleSelectConversation,
    handleDeleteConversation,
    loadMessages,
    loadConversations,
    sendMessage,
  }
}
