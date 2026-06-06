'use client'

import type { UIMessage } from 'ai'
import { Chat, useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'
import { extractTextFromUIMessage, toUIMessages } from '@/lib/chat/chat-messages'
import { chatApi, conversationsApi } from '@/lib/supabase/sdk'
import { useAppStore } from '@/store'
import { copyTextToClipboard } from '@/lib/utils'

/**
 * 主聊天页 useChat 包装。
 *
 * 与编辑器侧 novel-chat 的区别：
 *   - 单一 page、单 conversation key，不需要 draft/active 状态机
 *   - Chat 实例按 conversationId 持久化在 chatInstancesByKey Map 中，
 *     防止同一会话内 React 重渲染清空 messages
 *
 * 后端契约：POST /api/chat/stream 消费 AI SDK v6 UIMessageStreamResponse。
 * 入口对 conversationId 的合法性无要求——server 端 ensureConversation
 * 在 getById 失败时会 fall through 到 create，response header
 * X-Conversation-Id 仍带回服务端分配的 id。
 */

const chatInstancesByKey = new Map<string, Chat<UIMessage>>()
const streamControllersByKey = new Map<string, AbortController>()
const conversationIdOverridesByKey = new Map<string, string>()

function resolveConversationId(key: string): string | undefined {
  return conversationIdOverridesByKey.get(key)
}

function createChatInstance(key: string): Chat<UIMessage> {
  const transport = new DefaultChatTransport({
    api: '/api/chat/stream',
    fetch: async (input, init) => {
      streamControllersByKey.get(key)?.abort()
      const controller = new AbortController()
      streamControllersByKey.set(key, controller)

      const res = await fetch(input, {
        ...init,
        cache: 'no-store',
        signal: controller.signal,
      })
      const serverId = res.headers.get('X-Conversation-Id')
      if (serverId) conversationIdOverridesByKey.set(key, serverId)
      return res
    },
    prepareSendMessagesRequest: ({ messages, body }) => ({
      body: {
        ...body,
        messages,
        conversationId: resolveConversationId(key),
      },
    }),
  })

  return new Chat<UIMessage>({
    id: key,
    transport,
    onFinish: () => {
      streamControllersByKey.delete(key)
    },
    onError: (err) => {
      streamControllersByKey.delete(key)
      console.error('[chat/useChat] stream error:', err)
    },
  })
}

function getOrCreateChatInstance(key: string): Chat<UIMessage> {
  const existing = chatInstancesByKey.get(key)
  if (existing) return existing
  const instance = createChatInstance(key)
  chatInstancesByKey.set(key, instance)
  return instance
}

interface UseChatConversationProps {
  conversationId: string
}

export function useChatConversation({ conversationId }: UseChatConversationProps) {
  const { t } = useI18n()
  const chat = useMemo(() => getOrCreateChatInstance(conversationId), [conversationId])

  const { messages, sendMessage, setMessages, status, stop, error } = useChat({
    chat,
    id: conversationId,
  })

  const isStreaming = status === 'submitted' || status === 'streaming'

  // 同步流式状态到 zustand，左侧抽屉可以据此渲染 loading 指示器
  const setStreamingConversationId = useAppStore(s => s.chatActions.setStreamingConversationId)
  useEffect(() => {
    setStreamingConversationId(isStreaming ? conversationId : null)
  }, [isStreaming, conversationId, setStreamingConversationId])
  useEffect(() => {
    return () => {
      // 卸载时清掉——避免切到非 chat 页面后指示器残留
      setStreamingConversationId(null)
    }
  }, [setStreamingConversationId])
  const streamingMessageId = useMemo(() => {
    if (!isStreaming) return null
    const last = messages[messages.length - 1]
    return last?.role === 'assistant' ? last.id : null
  }, [isStreaming, messages])

  const [conversationTitle, setConversationTitle] = useState(t('chat.welcomeHeader.fallbackTitle'))

  // 加载历史消息
  const loadedConversationIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (loadedConversationIdRef.current === conversationId) return
    if (isStreaming) {
      // 流式进行中跳过，等结束后再视情况补
      loadedConversationIdRef.current = conversationId
      return
    }
    if (chat.messages.length > 0) {
      // 已有消息（可能来自挂载前的流连接或外部回填），不重新拉
      loadedConversationIdRef.current = conversationId
      return
    }

    let cancelled = false
    const load = async () => {
      try {
        const data = await chatApi.getMessages(conversationId)
        if (cancelled) return
        // 重新检查：fetch 期间 sendMessage 可能已经触发流式，chat 已写入消息
        if (chat.messages.length > 0 || chat.status === 'submitted' || chat.status === 'streaming') {
          loadedConversationIdRef.current = conversationId
          return
        }
        setMessages(toUIMessages(data))
        loadedConversationIdRef.current = conversationId
      } catch (err) {
        if (cancelled) return
        console.error('Failed to load conversation history:', err)
        setMessages([])
        loadedConversationIdRef.current = conversationId
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [conversationId, isStreaming, chat, setMessages])

  // 加载会话标题
  useEffect(() => {
    let cancelled = false
    const fetchTitle = async () => {
      try {
        const conversation = await conversationsApi.getById(conversationId)
        if (!cancelled && conversation?.title) setConversationTitle(conversation.title)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to load conversation title:', err)
      }
    }
    void fetchTitle()
  }, [conversationId])

  // 卸载时取消正在进行的 stream
  useEffect(() => {
    const key = conversationId
    return () => {
      streamControllersByKey.get(key)?.abort()
    }
  }, [conversationId])

  const latestAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i]
    }
    return null
  }, [messages])

  const handleSendMessage = useCallback(async (content: string) => {
    const text = content.trim()
    if (!text || isStreaming) return
    await sendMessage({ text })
  }, [isStreaming, sendMessage])

  return {
    messages,
    setMessages,
    isLoading: isStreaming,
    streamingMessageId,
    conversationTitle,
    latestAssistantMessage,
    handleSendMessage,
    stop,
    error,
    handleCopyMessage: async (message: UIMessage) => {
      const text = extractTextFromUIMessage(message)
      if (!text) return
      try {
        await copyTextToClipboard(text)
        toast.success(t('chat.messages.copied'))
      } catch (err) {
        console.error('Failed to copy message:', err)
        toast.error(t('chat.messages.copyFailedRetry'))
      }
    },
    handleShareMessage: async (message: UIMessage) => {
      const text = extractTextFromUIMessage(message)
      if (!text) return
      const sharePayload = { title: t('chat.messages.shareTitle'), text }
      try {
        if ('share' in navigator && typeof navigator.share === 'function') {
          await navigator.share(sharePayload)
        }
        else {
          await copyTextToClipboard(text)
          toast.success(t('chat.messages.copiedForShare'))
        }
      } catch (err) {
        console.error('Failed to share message:', err)
        toast.error(t('chat.messages.shareFailedLater'))
      }
    },
  }
}
