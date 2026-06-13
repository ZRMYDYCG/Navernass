import { createBoundStore } from '../../create-store'
import { createNovelChatActions } from './novel-chat.actions'
import { novelChatInitialState } from './novel-chat.initial-state'
import type { NovelChatStore } from './novel-chat.types'

export const useNovelChatStore = createBoundStore<NovelChatStore>('novel-chat-store', (set, get) => ({
  novelChat: novelChatInitialState,
  novelChatActions: createNovelChatActions(set, get),
}))
