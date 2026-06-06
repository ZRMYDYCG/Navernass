import type { StoreGet, StoreSet } from '../../store.types'
import type { ChatActions } from './chat.types'

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
  }
}
