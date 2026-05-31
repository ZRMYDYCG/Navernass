import type { AiMode, AiModel } from '@/app/(writing)/editor/_components/right-panel/types'
import type { NovelChatSelectedChapter } from '@/store'
import { Chat } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import { DefaultChatTransport } from 'ai'
import { sanitizeUIMessagesForModel } from '@/lib/ai/sanitize-ui-messages'
import { DRAFT_CONVERSATION_SLOT } from './conversation-keys'

export interface NovelChatSessionBridge {
  novelId: string
  conversationIdRef: { current: string | null }
  isDraftConversationRef: { current: boolean }
  modeRef: { current: AiMode }
  modelRef: { current: AiModel }
  selectedChaptersRef: { current: NovelChatSelectedChapter[] }
  setConversationIdFromHeader: (id: string) => void
  onStreamFinish: () => void
  onStreamError: (err: Error) => void
}

const chatInstancesByKey = new Map<string, Chat<UIMessage>>()
const streamControllersByKey = new Map<string, AbortController>()
const bridgesByKey = new Map<string, NovelChatSessionBridge>()
const transportKeyRefsByKey = new Map<string, { current: string }>()
/** draft→real rekey 后，旧 key 在 host 卸载前可能仍会 render，需重定向到真实实例 */
const rekeyRedirectByKey = new Map<string, string>()

function resolveInstanceKey(conversationKey: string): string {
  let resolved = conversationKey
  let next = rekeyRedirectByKey.get(resolved)
  while (next) {
    resolved = next
    next = rekeyRedirectByKey.get(resolved)
  }
  return resolved
}

function createDefaultBridge(novelId: string, conversationId: string | null): NovelChatSessionBridge {
  return {
    novelId,
    conversationIdRef: { current: conversationId },
    isDraftConversationRef: { current: conversationId === null },
    modeRef: { current: 'agent' },
    modelRef: { current: 'MiniMax-M2.7' },
    selectedChaptersRef: { current: [] },
    setConversationIdFromHeader: () => {},
    onStreamFinish: () => {},
    onStreamError: () => {},
  }
}

export function getNovelChatSessionBridge(conversationKey: string): NovelChatSessionBridge {
  const resolved = resolveInstanceKey(conversationKey)
  const existing = bridgesByKey.get(resolved)
  if (existing) return existing
  const { novelId, slot } = parseKey(resolved)
  const bridge = createDefaultBridge(
    novelId,
    slot === DRAFT_CONVERSATION_SLOT ? null : slot,
  )
  bridgesByKey.set(resolved, bridge)
  return bridge
}

export function abortNovelChatStream(conversationKey: string) {
  const resolved = resolveInstanceKey(conversationKey)
  streamControllersByKey.get(resolved)?.abort()
  streamControllersByKey.delete(resolved)
}

export function rekeyNovelChatInstance(fromKey: string, toKey: string) {
  const instance = chatInstancesByKey.get(fromKey)
  if (instance) {
    chatInstancesByKey.set(toKey, instance)
    chatInstancesByKey.delete(fromKey)
  }

  const controller = streamControllersByKey.get(fromKey)
  if (controller) {
    streamControllersByKey.set(toKey, controller)
    streamControllersByKey.delete(fromKey)
  }

  const bridge = bridgesByKey.get(fromKey)
  if (bridge) {
    bridgesByKey.set(toKey, bridge)
    bridgesByKey.delete(fromKey)
  }

  const keyRef = transportKeyRefsByKey.get(fromKey)
  if (keyRef) {
    keyRef.current = toKey
    transportKeyRefsByKey.set(toKey, keyRef)
    transportKeyRefsByKey.delete(fromKey)
  }

  rekeyRedirectByKey.set(fromKey, toKey)
}

function parseKey(conversationKey: string) {
  const idx = conversationKey.indexOf(':')
  if (idx === -1) return { novelId: conversationKey, slot: DRAFT_CONVERSATION_SLOT }
  return { novelId: conversationKey.slice(0, idx), slot: conversationKey.slice(idx + 1) }
}

function createTransportForConversation(keyRef: { current: string }) {
  return new DefaultChatTransport({
    api: '/api/editor/novel-conversations/stream',
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const conversationKey = keyRef.current
      const { novelId } = parseKey(conversationKey)
      const method = init?.method ?? 'POST'
      if (method === 'GET') {
        return new Response(null, { status: 204 })
      }

      streamControllersByKey.get(conversationKey)?.abort()
      const controller = new AbortController()
      streamControllersByKey.set(conversationKey, controller)

      const res = await fetch(input, {
        method,
        headers: init?.headers,
        body: init?.body,
        credentials: init?.credentials,
        cache: 'no-store',
        signal: controller.signal,
      })
      const id = res.headers.get('X-Conversation-Id')
      if (id) getNovelChatSessionBridge(conversationKey).setConversationIdFromHeader(id)
      return res
    },
    prepareSendMessagesRequest: ({ messages, body }) => {
      const conversationKey = keyRef.current
      const { novelId } = parseKey(conversationKey)
      const bridge = getNovelChatSessionBridge(conversationKey)
      return {
        body: {
          ...body,
          messages: sanitizeUIMessagesForModel(messages),
          novelId,
          conversationId: bridge.conversationIdRef.current || undefined,
          selectedChapterIds: bridge.selectedChaptersRef.current.map(c => c.id),
          mode: bridge.modeRef.current,
          model: bridge.modelRef.current,
        },
      }
    },
  })
}

export function getOrCreateNovelChatInstance(conversationKey: string): Chat<UIMessage> {
  const resolved = resolveInstanceKey(conversationKey)
  if (resolved !== conversationKey) {
    return getOrCreateNovelChatInstance(resolved)
  }

  const existing = chatInstancesByKey.get(conversationKey)
  if (existing) return existing

  const keyRef = { current: conversationKey }
  transportKeyRefsByKey.set(conversationKey, keyRef)

  const instance = new Chat<UIMessage>({
    id: conversationKey,
    transport: createTransportForConversation(keyRef),
    onFinish: () => {
      const key = keyRef.current
      streamControllersByKey.delete(key)
      getNovelChatSessionBridge(key).onStreamFinish()
    },
    onError: (err) => {
      const key = keyRef.current
      streamControllersByKey.delete(key)
      getNovelChatSessionBridge(key).onStreamError(err)
    },
  })
  chatInstancesByKey.set(conversationKey, instance)
  return instance
}

export function removeNovelChatInstance(conversationKey: string) {
  abortNovelChatStream(conversationKey)
  chatInstancesByKey.delete(conversationKey)
  bridgesByKey.delete(conversationKey)
  transportKeyRefsByKey.delete(conversationKey)
  rekeyRedirectByKey.delete(conversationKey)
  for (const [from, to] of rekeyRedirectByKey.entries()) {
    if (to === conversationKey) rekeyRedirectByKey.delete(from)
  }
}
