'use client'

import type { UIMessage } from 'ai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  type ChatAiMode,
  normalizeChatMode,
} from '@/lib/ai/agents'
import type { AiModel } from '@/app/(writing)/editor/_components/right-panel/types'
import { useI18n } from '@/hooks/use-i18n'
import { charactersApi, chatApi, conversationsApi, novelsApi, outlinesApi } from '@/lib/supabase/sdk'
import { useAppStore } from '@/store'
import { useChatConversation } from './use-chat-conversation'

/**
 * Chat Agent 高阶 hook：把 useChatConversation 与 mode/model 状态、桥接工具的 accept 流程串起来。
 *
 * 职责：
 *   1) 读 conversation 行恢复 mode/model
 *   2) 消费 welcome store 携带的 mode/model（用户在欢迎页选过的话）
 *   3) 暴露 setMode / setModel：写回 conversationsApi.update
 *   4) 暴露 propose_* accept 处理器：调 SDK → 更新 part.output → toast
 *   5) rejectProposal：把 part.output 标记为 rejected
 */
export function useChatAgent({ conversationId }: { conversationId: string }) {
  const { t } = useI18n()
  const consumeWelcomeAgent = useAppStore(s => s.chatActions.consumeWelcomeAgent)

  const [mode, setModeState] = useState<ChatAiMode>('ask')
  const [model, setModelState] = useState<AiModel>('MiniMax-M3')
  const [isAgentStateReady, setIsAgentStateReady] = useState(false)

  // 1) 加载 conversation 行的 mode/model
  // 2) 消费 welcome store 的 mode/model（用户从 /chat 跳来时选过的）
  const initialLoadDoneRef = useRef(false)
  useEffect(() => {
    if (initialLoadDoneRef.current) return
    let cancelled = false
    const load = async () => {
      try {
        const conversation = await conversationsApi.getById(conversationId)
        if (cancelled) return
        const welcomeAgent = consumeWelcomeAgent()
        const nextMode = welcomeAgent?.mode
          || (conversation?.mode ? normalizeChatMode(conversation.mode) : 'ask')
        const nextModel = (welcomeAgent?.model || conversation?.model || 'MiniMax-M3') as AiModel
        setModeState(nextMode)
        setModelState(nextModel)
        // 把 welcome mode/model 落库（若与 conversation 行不一致）
        if (welcomeAgent && (conversation?.mode !== welcomeAgent.mode || conversation?.model !== welcomeAgent.model)) {
          try {
            await conversationsApi.update({ id: conversationId, mode: welcomeAgent.mode, model: welcomeAgent.model })
          } catch (err) {
            console.warn('[useChatAgent] failed to persist welcome agent:', err)
          }
        }
        initialLoadDoneRef.current = true
        setIsAgentStateReady(true)
      } catch (err) {
        if (cancelled) return
        console.error('[useChatAgent] failed to load conversation agent state:', err)
        initialLoadDoneRef.current = true
        setIsAgentStateReady(true)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [conversationId, consumeWelcomeAgent])

  const setMode = useCallback(async (next: ChatAiMode) => {
    if (next === mode) return
    setModeState(next)
    try {
      await conversationsApi.update({ id: conversationId, mode: next })
    } catch (err) {
      console.error('[useChatAgent] failed to persist mode:', err)
      toast.error(t('chat.agent.errors.persistModeFailed'))
    }
  }, [conversationId, mode, t])

  const setModel = useCallback(async (next: AiModel) => {
    if (next === model) return
    setModelState(next)
    try {
      await conversationsApi.update({ id: conversationId, model: next })
    } catch (err) {
      console.error('[useChatAgent] failed to persist model:', err)
      toast.error(t('chat.agent.errors.persistModelFailed'))
    }
  }, [conversationId, model, t])

  const chat = useChatConversation({ conversationId, mode, model })

  // 工具：根据 toolCallId 找到对应 part 的 index（不依赖 toolCallId 唯一性，仅匹配类型 + 第一个未 done 的）
  // 实际我们用 toolCallId 即可，因为每个 tool call 都有唯一 id
  const updatePartOutput = useCallback((
    messages: UIMessage[],
    setMessages: (messages: UIMessage[]) => void,
    toolCallId: string,
    mutator: (part: any) => any,
  ) => {
    let mutated = false
    const next = messages.map((m) => {
      if (m.role !== 'assistant') return m
      const parts = (m.parts || []) as any[]
      const idx = parts.findIndex(p => p?.type?.startsWith('tool-') && p?.toolCallId === toolCallId)
      if (idx < 0) return m
      mutated = true
      const newParts = [...parts]
      newParts[idx] = mutator(newParts[idx])
      return { ...m, parts: newParts }
    })
    if (mutated) setMessages(next)
  }, [])

  // 把 part.output 同步落库：避免刷新页面后状态丢失。
  // 静默失败即可——本地状态已经更新成功，DB 落库是 best-effort。
  const persistPartOutput = useCallback(async (
    toolCallId: string,
    nextOutput: Record<string, unknown>,
  ) => {
    try {
      await chatApi.updatePartOutput({
        conversationId,
        toolCallId,
        output: nextOutput,
      })
    } catch (err) {
      console.warn('[useChatAgent] failed to persist part output:', err)
    }
  }, [conversationId])

  // ===== propose_novel accept =====
  const acceptNovelProposal = useCallback(async (
    toolCallId: string,
    payload: { title: string, description?: string, category?: string, tags?: string[], summary?: string },
  ) => {
    let acceptedOutput: Record<string, unknown> | null = null
    let errorOutput: Record<string, unknown> | null = null
    try {
      const novel = await novelsApi.create({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        tags: payload.tags,
      })
      acceptedOutput = {
        ...(payload as Record<string, unknown>),
        ok: true,
        status: 'accepted',
        entityId: novel.id,
        entityTitle: novel.title,
        jumpUrl: `/editor?id=${novel.id}`,
      }
      updatePartOutput(chat.messages, chat.setMessages, toolCallId, (part) => ({
        ...part,
        output: acceptedOutput,
      }))
      void persistPartOutput(toolCallId, acceptedOutput)
      toast.success(t('chat.agent.tools.proposeNovel.accepted', { title: novel.title }))
    } catch (err) {
      console.error('[useChatAgent] acceptNovelProposal failed:', err)
      errorOutput = {
        ...(payload as Record<string, unknown>),
        ok: false,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }
      updatePartOutput(chat.messages, chat.setMessages, toolCallId, (part) => ({
        ...part,
        output: errorOutput,
      }))
      if (errorOutput) void persistPartOutput(toolCallId, errorOutput)
      toast.error(t('chat.agent.tools.common.acceptFailed'))
    }
  }, [chat.messages, chat.setMessages, updatePartOutput, persistPartOutput, t])

  // ===== propose_character accept =====
  const acceptCharacterProposal = useCallback(async (
    toolCallId: string,
    payload: { novelId: string, name: string, role?: string, description?: string, traits?: string[], keywords?: string[] },
  ) => {
    try {
      const character = await charactersApi.create({
        novel_id: payload.novelId,
        name: payload.name,
        role: payload.role,
        description: payload.description,
        traits: payload.traits,
        keywords: payload.keywords,
      })
      const acceptedOutput: Record<string, unknown> = {
        ...(payload as Record<string, unknown>),
        ok: true,
        status: 'accepted',
        entityId: character.id,
        entityTitle: character.name,
        jumpUrl: `/editor?id=${payload.novelId}&characterId=${character.id}`,
      }
      updatePartOutput(chat.messages, chat.setMessages, toolCallId, (part) => ({
        ...part,
        output: acceptedOutput,
      }))
      void persistPartOutput(toolCallId, acceptedOutput)
      toast.success(t('chat.agent.tools.proposeCharacter.accepted', { name: character.name }))
    } catch (err) {
      console.error('[useChatAgent] acceptCharacterProposal failed:', err)
      const errorOutput: Record<string, unknown> = {
        ...(payload as Record<string, unknown>),
        ok: false,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }
      updatePartOutput(chat.messages, chat.setMessages, toolCallId, (part) => ({
        ...part,
        output: errorOutput,
      }))
      void persistPartOutput(toolCallId, errorOutput)
      toast.error(t('chat.agent.tools.common.acceptFailed'))
    }
  }, [chat.messages, chat.setMessages, updatePartOutput, persistPartOutput, t])

  // ===== propose_outline accept =====
  const acceptOutlineProposal = useCallback(async (
    toolCallId: string,
    payload: { novelId: string, title: string, content?: string, volumeId?: string, parentId?: string },
  ) => {
    try {
      const outline = await outlinesApi.create({
        novel_id: payload.novelId,
        title: payload.title,
        content: payload.content,
        volume_id: payload.volumeId,
        parent_id: payload.parentId,
        order_index: 0,
      })
      const acceptedOutput: Record<string, unknown> = {
        ...(payload as Record<string, unknown>),
        ok: true,
        status: 'accepted',
        entityId: outline.id,
        entityTitle: outline.title,
        jumpUrl: `/editor?id=${payload.novelId}`,
      }
      updatePartOutput(chat.messages, chat.setMessages, toolCallId, (part) => ({
        ...part,
        output: acceptedOutput,
      }))
      void persistPartOutput(toolCallId, acceptedOutput)
      toast.success(t('chat.agent.tools.proposeOutline.accepted', { title: outline.title }))
    } catch (err) {
      console.error('[useChatAgent] acceptOutlineProposal failed:', err)
      const errorOutput: Record<string, unknown> = {
        ...(payload as Record<string, unknown>),
        ok: false,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }
      updatePartOutput(chat.messages, chat.setMessages, toolCallId, (part) => ({
        ...part,
        output: errorOutput,
      }))
      void persistPartOutput(toolCallId, errorOutput)
      toast.error(t('chat.agent.tools.common.acceptFailed'))
    }
  }, [chat.messages, chat.setMessages, updatePartOutput, persistPartOutput, t])

  // ===== reject（通用）=====
  const rejectProposal = useCallback((toolCallId: string) => {
    let rejectedOutput: Record<string, unknown> | null = null
    updatePartOutput(chat.messages, chat.setMessages, toolCallId, (part) => {
      rejectedOutput = {
        ...(part.output || {}),
        status: 'rejected',
      }
      return { ...part, output: rejectedOutput }
    })
    if (rejectedOutput) void persistPartOutput(toolCallId, rejectedOutput)
  }, [chat.messages, chat.setMessages, updatePartOutput, persistPartOutput])

  // ===== markFormSubmitted（ask_user 表单）=====
  // 把 part.output 标记为 submitted=true 并写回用户填的值；同步落库。
  const markFormSubmitted = useCallback((
    toolCallId: string,
    submittedValues: Record<string, string>,
  ) => {
    let nextOutput: Record<string, unknown> | null = null
    updatePartOutput(chat.messages, chat.setMessages, toolCallId, (part) => {
      nextOutput = {
        ...(part.output || {}),
        submitted: true,
        submittedAt: new Date().toISOString(),
        submittedValues,
      }
      return { ...part, output: nextOutput }
    })
    if (nextOutput) void persistPartOutput(toolCallId, nextOutput)
  }, [chat.messages, chat.setMessages, updatePartOutput, persistPartOutput])

  return useMemo(() => ({
    // 来自 useChatConversation
    messages: chat.messages,
    setMessages: chat.setMessages,
    isLoading: chat.isLoading,
    streamingMessageId: chat.streamingMessageId,
    conversationTitle: chat.conversationTitle,
    handleSendMessage: chat.handleSendMessage,
    handleCopyMessage: chat.handleCopyMessage,
    handleShareMessage: chat.handleShareMessage,
    stop: chat.stop,
    error: chat.error,
    // Agent 专属
    mode,
    model,
    setMode,
    setModel,
    isAgentStateReady,
    // 桥接工具 accept
    acceptNovelProposal,
    acceptCharacterProposal,
    acceptOutlineProposal,
    rejectProposal,
    markFormSubmitted,
  }), [
    chat, mode, model, setMode, setModel, isAgentStateReady,
    acceptNovelProposal, acceptCharacterProposal, acceptOutlineProposal, rejectProposal,
    markFormSubmitted,
  ])
}
