import { createBoundStore } from '../../create-store'
import { createChatActions } from './chat.actions'
import { chatInitialState } from './chat.initial-state'
import type { ChatStore } from './chat.types'

export const useChatStore = createBoundStore<ChatStore>('chat-store', (set, get) => ({
  chat: chatInitialState,
  chatActions: createChatActions(set, get),
}))
