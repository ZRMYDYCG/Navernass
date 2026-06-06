'use client'

import type { NovelConversation } from '@/lib/supabase/sdk'
import type { Chapter } from '@/lib/supabase/sdk'
import type { UIMessage } from 'ai'
import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { novelConversationsApi } from '@/lib/supabase/sdk'
import {
  selectOrderedChapters,
  selectOrderedOutlines,
  selectOrderedWorldbookEntries,
  selectNovelChatUiSession,
  useAppStore,
} from '@/store'
import { useNovelChatContext } from './context'
import { useNovelChatRuntime } from './provider'
import { makeConversationKey } from './conversation-keys'
import { buildUserComposerMessage } from '@/lib/editor/composer-message'
import { chapterRefsEqual, hasComposerContent } from '@/lib/editor/inline-composer'
import { fromChapterRefs, resetDraftConversation, toChapterRefs } from './session-host'
import { messageHasVisibleContent } from '../parts/registry'
import { getNovelChatSessionBridge } from './chat-instances'

export function useNovelChat() {
  const searchParams = useSearchParams()
  const novelId = searchParams.get('id') || ''
  const { ensureSession } = useNovelChatContext()

  const setActiveNovelId = useAppStore(s => s.novelChatActions.setActiveNovelId)
  const patchUiSession = useAppStore(s => s.novelChatActions.patchUiSession)
  const uiSession = useAppStore(s => selectNovelChatUiSession(s, novelId))

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

  /** 已提交、尚未创建助手消息占位（建立连接 / 等待响应头） */
  const isAwaitingConnection = useMemo(() => {
    if (!isLoading) return false
    return !streamingMessageId
  }, [isLoading, streamingMessageId])

  /** 助手消息已创建但尚无可见内容（等待首 token） */
  const isAwaitingFirstToken = useMemo(() => {
    if (!isLoading || !streamingMessageId) return false
    const streamingMessage = messages.find(m => m.id === streamingMessageId)
    if (!streamingMessage) return true
    return !messageHasVisibleContent(streamingMessage, true)
  }, [isLoading, streamingMessageId, messages])

  const mode = uiSession?.mode ?? 'agent'
  const model = uiSession?.model ?? 'MiniMax-M3'
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
    const current = useAppStore.getState().novelChat.sessionsByNovelId[novelId]?.input ?? ''
    const next = typeof value === 'function' ? value(current) : value
    if (next === current) return
    patchUiSession(novelId, { input: next })
  }, [novelId, patchUiSession])

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
    const session = useAppStore.getState().novelChat.sessionsByNovelId[novelId]
    const current = toChapterRefs(session?.selectedChapters ?? [])
    const next = typeof chapters === 'function' ? chapters(current) : chapters
    const nextRefs = fromChapterRefs(next)
    const currentRefs = session?.selectedChapters ?? []
    if (chapterRefsEqual(
      currentRefs.map(c => ({ id: c.id, title: c.title })),
      nextRefs.map(c => ({ id: c.id, title: c.title })),
    )) {
      return
    }
    patchUiSession(novelId, { selectedChapters: nextRefs })
  }, [novelId, patchUiSession])

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

  const handleSend = useCallback(async () => {
    const raw = input
    if (!hasComposerContent(raw) || isLoading || !novelId || !sendMessage) return

    const orderedChapters = selectOrderedChapters(useAppStore.getState())
    const allCharacters = useAppStore.getState().characterMaterial.characters
      .filter(c => !c.novel_id || c.novel_id === novelId)
      .map(c => ({ id: c.id, name: c.name }))
    const allWorldbookEntries = selectOrderedWorldbookEntries(useAppStore.getState())
      .map(e => ({ id: e.id, title: e.title }))
    const allOutlines = selectOrderedOutlines(useAppStore.getState())
      .map(o => ({ id: o.id, title: o.title }))
    const payload = buildUserComposerMessage(
      raw,
      orderedChapters,
      allCharacters,
      allWorldbookEntries,
      allOutlines,
    )
    const chapterRefs = fromChapterRefs(toChapterRefs(payload.chapters))
    const conversationKey = makeConversationKey(novelId, currentConversationId, isDraftConversation)
    const bridge = getNovelChatSessionBridge(conversationKey)
    bridge.isDraftConversationRef.current = false
    bridge.selectedChaptersRef.current = chapterRefs
    bridge.selectedCharactersRef.current = payload.characters

    patchUiSession(novelId, {
      input: '',
      selectedChapters: chapterRefs,
      isDraftConversation: false,
    })

    try {
      await sendMessage({
        parts: payload.parts as UIMessage['parts'],
      })
      patchUiSession(novelId, { selectedChapters: [] })
      bridge.selectedChaptersRef.current = []
      bridge.selectedCharactersRef.current = []
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
    isAwaitingConnection,
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
