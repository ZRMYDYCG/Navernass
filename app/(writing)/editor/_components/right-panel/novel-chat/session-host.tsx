'use client'

import type { NovelChatRuntime } from './context'
import type { Chapter } from '@/lib/supabase/sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { novelConversationsApi } from '@/lib/supabase/sdk'
import { useNovelChatStore } from '@/store'
import { removeNovelChatInstance } from './chat-instances'
import { NovelChatConversationHost } from './conversation-host'
import { DRAFT_CONVERSATION_SLOT, makeConversationKey } from './conversation-keys'

interface NovelChatSessionHostProps {
  novelId: string
  registerRuntime: (novelId: string, runtime: NovelChatRuntime | null) => void
}

export function NovelChatSessionHost({ novelId, registerRuntime }: NovelChatSessionHostProps) {
  const patchUiSession = useNovelChatStore(s => s.patchUiSession)
  const uiSession = useNovelChatStore(s => s.sessionsByNovelId[novelId])

  const currentConversationId = uiSession?.currentConversationId ?? null
  const isDraftConversation = uiSession?.isDraftConversation ?? false

  const streamingKeysRef = useRef<Set<string>>(new Set())
  const [streamingKeysVersion, setStreamingKeysVersion] = useState(0)
  const rekeyMapRef = useRef<Map<string, string>>(new Map())

  const loadConversationsRef = useRef<() => Promise<void>>(async () => {})

  const activeKey = makeConversationKey(novelId, currentConversationId, isDraftConversation)

  const resolveKey = useCallback((key: string) => {
    let resolved = key
    let next = rekeyMapRef.current.get(resolved)
    while (next) {
      resolved = next
      next = rekeyMapRef.current.get(resolved)
    }
    return resolved
  }, [])

  // draft 首条消息 rekey 后清掉映射，避免下次「新建对话」仍指向旧会话
  useEffect(() => {
    if (isDraftConversation) {
      for (const from of [...rekeyMapRef.current.keys()]) {
        if (from.endsWith(`:${DRAFT_CONVERSATION_SLOT}`)) {
          rekeyMapRef.current.delete(from)
        }
      }
    }
  }, [isDraftConversation])

  const mountedKeys = useMemo(() => {
    const keys = new Set<string>()
    // activeKey 不做 resolve —— 否则 draft 会被 rekeyMap 指向上一次创建的会话
    keys.add(activeKey)
    for (const key of streamingKeysRef.current) {
      keys.add(resolveKey(key))
    }
    return [...keys]
  }, [activeKey, resolveKey, streamingKeysVersion])

  const handleStreamStatusChange = useCallback((conversationKey: string, isStreaming: boolean) => {
    const resolved = resolveKey(conversationKey)
    const prev = streamingKeysRef.current.has(resolved)
    if (isStreaming && !prev) {
      streamingKeysRef.current.add(resolved)
      setStreamingKeysVersion(v => v + 1)
    } else if (!isStreaming && prev) {
      streamingKeysRef.current.delete(resolved)
      setStreamingKeysVersion(v => v + 1)
    }
  }, [resolveKey])

  const handleConversationIdAssigned = useCallback((fromKey: string, conversationId: string) => {
    const toKey = makeConversationKey(novelId, conversationId, false)
    rekeyMapRef.current.set(fromKey, toKey)
    if (streamingKeysRef.current.has(fromKey)) {
      streamingKeysRef.current.delete(fromKey)
      streamingKeysRef.current.add(toKey)
    }
    setStreamingKeysVersion(v => v + 1)
    // 首条消息已拿到 id，draft→real 的 rekey 映射使命完成，避免污染后续新建对话
    queueMicrotask(() => {
      rekeyMapRef.current.delete(fromKey)
    })
  }, [novelId])

  const loadConversations = useCallback(async () => {
    try {
      const data = await novelConversationsApi.getByNovelId(novelId)
      patchUiSession(novelId, { conversations: data, conversationsLoaded: true })
    } catch (e) {
      console.error('Failed to load conversations:', e)
    }
  }, [novelId, patchUiSession])

  loadConversationsRef.current = loadConversations

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  return (
    <>
      {mountedKeys.map((key) => {
        const isActive = key === activeKey
        const isDraft = key.endsWith(`:${DRAFT_CONVERSATION_SLOT}`)
        const conversationId = isDraft ? null : key.slice(novelId.length + 1)

        return (
          <NovelChatConversationHost
            key={key}
            conversationKey={key}
            novelId={novelId}
            conversationId={conversationId}
            isDraft={isDraft}
            isActive={isActive}
            registerRuntime={registerRuntime}
            onStreamStatusChange={handleStreamStatusChange}
            onConversationIdAssigned={handleConversationIdAssigned}
            loadConversationsRef={loadConversationsRef}
          />
        )
      })}
    </>
  )
}

export function resetDraftConversation(novelId: string) {
  removeNovelChatInstance(makeConversationKey(novelId, null, true))
}

export function toChapterRefs(chapters: Array<{ id: string, title: string }>): Chapter[] {
  return chapters.map(ch => ({
    id: ch.id,
    title: ch.title,
    novel_id: '',
    user_id: '',
    content: '',
    order_index: 0,
    word_count: 0,
    status: 'draft' as const,
    created_at: '',
    updated_at: '',
  }))
}

export function fromChapterRefs(chapters: Chapter[]): Array<{ id: string, title: string }> {
  return chapters.map(ch => ({ id: ch.id, title: ch.title }))
}
