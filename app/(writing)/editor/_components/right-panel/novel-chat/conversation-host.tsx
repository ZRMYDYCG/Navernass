'use client'

import { useChat } from '@ai-sdk/react'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { toUIMessages } from '@/lib/editor/novel-chat-messages'
import { novelConversationsApi } from '@/lib/supabase/sdk'
import { useNovelChatStore } from '@/store'
import type { NovelChatRuntime } from './context'
import {
  abortNovelChatStream,
  getNovelChatSessionBridge,
  getOrCreateNovelChatInstance,
  rekeyNovelChatInstance,
} from './chat-instances'
import { DRAFT_CONVERSATION_SLOT, makeConversationKey } from './conversation-keys'

interface NovelChatConversationHostProps {
  conversationKey: string
  novelId: string
  conversationId: string | null
  isDraft: boolean
  isActive: boolean
  registerRuntime: (novelId: string, runtime: NovelChatRuntime | null) => void
  onStreamStatusChange: (conversationKey: string, isStreaming: boolean) => void
  onConversationIdAssigned: (fromKey: string, conversationId: string) => void
  loadConversationsRef: React.MutableRefObject<() => Promise<void>>
}

export function NovelChatConversationHost({
  conversationKey,
  novelId,
  conversationId,
  isDraft,
  isActive,
  registerRuntime,
  onStreamStatusChange,
  onConversationIdAssigned,
  loadConversationsRef,
}: NovelChatConversationHostProps) {
  const { t } = useI18n()
  const loadedConversationIdRef = useRef<string | null>(null)

  const patchUiSession = useNovelChatStore(s => s.patchUiSession)
  const uiSession = useNovelChatStore(s => s.sessionsByNovelId[novelId])

  const mode = uiSession?.mode ?? 'agent'
  const model = uiSession?.model ?? 'MiniMax-M3'

  const bridge = getNovelChatSessionBridge(conversationKey)
  bridge.conversationIdRef.current = conversationId
  bridge.isDraftConversationRef.current = isDraft
  bridge.modeRef.current = mode
  bridge.modelRef.current = model
  bridge.selectedChaptersRef.current = uiSession?.selectedChapters ?? []

  bridge.setConversationIdFromHeader = (id: string) => {
    if (bridge.isDraftConversationRef.current && bridge.conversationIdRef.current !== null) return
    if (bridge.conversationIdRef.current === id) return

    bridge.conversationIdRef.current = id
    bridge.isDraftConversationRef.current = false

    const newKey = makeConversationKey(novelId, id, false)
    rekeyNovelChatInstance(conversationKey, newKey)

    patchUiSession(novelId, { currentConversationId: id, isDraftConversation: false })
    onConversationIdAssigned(conversationKey, id)
    void loadConversationsRef.current()
  }

  bridge.onStreamFinish = () => {
    void loadConversationsRef.current()
  }
  bridge.onStreamError = (err) => {
    console.error('useChat error:', err)
    void loadConversationsRef.current()
  }

  const chat = getOrCreateNovelChatInstance(conversationKey)

  const { messages, sendMessage, setMessages, status, stop, error } = useChat({
    chat,
    id: conversationKey,
  })

  const isStreaming = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    onStreamStatusChange(conversationKey, isStreaming)
    return () => onStreamStatusChange(conversationKey, false)
  }, [conversationKey, isStreaming, onStreamStatusChange])

  const stopStreaming = useCallback(async () => {
    abortNovelChatStream(conversationKey)
    await stop()
  }, [conversationKey, stop])

  const loadMessages = useCallback(async (targetConversationId: string) => {
    if (!isActive) return
    patchUiSession(novelId, { isLoadingMessages: true, loadMessagesError: null })
    try {
      const data = await novelConversationsApi.getMessages(targetConversationId)
      setMessages(toUIMessages(data))
    } catch (e) {
      console.error('Failed to load messages:', e)
      setMessages([])
      const msg = e instanceof Error ? e.message : t('editor.rightPanel.loadMessagesFailed')
      patchUiSession(novelId, { loadMessagesError: msg })
    } finally {
      patchUiSession(novelId, { isLoadingMessages: false })
    }
  }, [novelId, patchUiSession, setMessages, t, isActive])

  const loadConversations = useCallback(async () => {
    try {
      const data = await novelConversationsApi.getByNovelId(novelId)
      patchUiSession(novelId, { conversations: data, conversationsLoaded: true })
    } catch (e) {
      console.error('Failed to load conversations:', e)
    }
  }, [novelId, patchUiSession])

  const runtimeRef = useRef<NovelChatRuntime | null>(null)

  runtimeRef.current = {
    novelId,
    messages,
    status,
    error,
    sendMessage: async (message) => {
      bridge.isDraftConversationRef.current = false
      if (isActive) {
        patchUiSession(novelId, { isDraftConversation: false })
      }
      await sendMessage(message)
    },
    stop: stopStreaming,
    setMessages,
    loadMessages,
    loadConversations,
  }

  useLayoutEffect(() => {
    if (!isActive) return
    registerRuntime(novelId, {
      ...runtimeRef.current!,
      novelId,
      messages: chat.messages,
      status: chat.status,
      error: chat.error,
    })
  }, [isActive, conversationKey, novelId, registerRuntime, chat, messages, status, error])

  useEffect(() => {
    if (!isActive) return

    const syncRuntime = () => {
      const base = runtimeRef.current
      if (!base) return
      registerRuntime(novelId, {
        ...base,
        novelId,
        messages: chat.messages,
        status: chat.status,
        error: chat.error,
      })
    }

    const unsubMessages = chat['~registerMessagesCallback'](syncRuntime)
    const unsubStatus = chat['~registerStatusCallback'](syncRuntime)
    const unsubError = chat['~registerErrorCallback'](syncRuntime)

    return () => {
      unsubMessages()
      unsubStatus()
      unsubError()
    }
  }, [novelId, chat, registerRuntime, isActive])

  useEffect(() => {
    if (!isActive) return
    if (isStreaming) return

    if (conversationId) {
      const conversationChanged = loadedConversationIdRef.current !== conversationId
      if (conversationChanged) {
        loadedConversationIdRef.current = conversationId
        if (messages.length === 0) {
          void loadMessages(conversationId)
        }
      } else if (messages.length === 0) {
        void loadMessages(conversationId)
      }
    } else if (isDraft) {
      loadedConversationIdRef.current = null
      if (messages.length > 0) {
        setMessages([])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isActive, isStreaming, isDraft, conversationKey])

  return null
}

export function isDraftConversationKey(conversationKey: string): boolean {
  return conversationKey.endsWith(`:${DRAFT_CONVERSATION_SLOT}`)
}
