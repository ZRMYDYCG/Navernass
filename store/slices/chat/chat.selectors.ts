import type { AppStore } from '../../store.types'

export const selectChat = (state: AppStore) => state.chat
export const selectChatWelcomeInput = (state: AppStore) => state.chat.welcomeInput
export const selectChatPendingDraftMessage = (state: AppStore) => state.chat.pendingDraftMessage
export const selectChatStreamingConversationId = (state: AppStore) => state.chat.streamingConversationId
