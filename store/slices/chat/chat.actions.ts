import type { StoreGet, StoreSet } from '../../store.types'
import type { ChatActions, ChatAiMode } from './chat.types'
import type { AiModel } from '@/app/(writing)/editor/_components/right-panel/types'

export function createChatActions(set: StoreSet, get: StoreGet): ChatActions {
  return {
    setWelcomeInput: (input) => {
      set((state) => {
        state.chat.welcomeInput = input
      }, false, 'chat/setWelcomeInput')
    },

    setPendingDraftMessage: (msg) => {
      set((state) => {
        state.chat.pendingDraftMessage = msg
      }, false, 'chat/setPendingDraftMessage')
    },

    consumePendingDraftMessage: () => {
      const value = get().chat.pendingDraftMessage
      if (value === null) return null
      set((state) => {
        state.chat.pendingDraftMessage = null
      }, false, 'chat/consumePendingDraftMessage')
      return value
    },

    setStreamingConversationId: (id) => {
      set((state) => {
        if (state.chat.streamingConversationId === id) return
        state.chat.streamingConversationId = id
      }, false, 'chat/setStreamingConversationId')
    },

    setWelcomeMode: (mode) => {
      set((state) => {
        state.chat.welcomeMode = mode
      }, false, 'chat/setWelcomeMode')
    },

    setWelcomeModel: (model) => {
      set((state) => {
        state.chat.welcomeModel = model
      }, false, 'chat/setWelcomeModel')
    },

    consumeWelcomeAgent: () => {
      const { welcomeMode, welcomeModel } = get().chat
      if (welcomeMode === 'ask' && welcomeModel === 'MiniMax-M3') {
        // 与初始态一致时不必消费（避免无谓写入 conversation 行）
        return null
      }
      const payload = { mode: welcomeMode, model: welcomeModel }
      set((state) => {
        state.chat.welcomeMode = 'ask'
        state.chat.welcomeModel = 'MiniMax-M3'
      }, false, 'chat/consumeWelcomeAgent')
      return payload
    },
  }
}

export type { ChatAiMode, AiModel }
