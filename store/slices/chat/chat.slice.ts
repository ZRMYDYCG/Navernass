import type { StoreSlice } from '../../store.types'
import { createChatActions } from './chat.actions'
import { chatInitialState } from './chat.initial-state'
import type { ChatSlice } from './chat.types'

export const createChatSlice: StoreSlice<ChatSlice> = (set, get) => ({
  chat: chatInitialState,
  chatActions: createChatActions(set, get),
})
