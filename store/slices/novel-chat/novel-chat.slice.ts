import type { StoreSlice } from '../../store.types'
import { createNovelChatActions } from './novel-chat.actions'
import { novelChatInitialState } from './novel-chat.initial-state'
import type { NovelChatSlice } from './novel-chat.types'

export const createNovelChatSlice: StoreSlice<NovelChatSlice> = (set, get) => ({
  novelChat: novelChatInitialState,
  novelChatActions: createNovelChatActions(set, get),
})
