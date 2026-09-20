import type { ChatStore } from './chat.types'

export const selectChat = (state: ChatStore) => state.chat
export const selectChatWelcomeInput = (state: ChatStore) => state.chat.welcomeInput
export const selectChatPendingDraftMessage = (state: ChatStore) => state.chat.pendingDraftMessage
export const selectChatStreamingConversationId = (state: ChatStore) => state.chat.streamingConversationId
