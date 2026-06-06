import { applyPartialPatch } from '../../utils'
import type { StoreGet, StoreSet } from '../../store.types'
import type {
  NovelChatActions,
  NovelChatUiSession,
} from './novel-chat.types'

function createDefaultUiSession(): NovelChatUiSession {
  return {
    currentConversationId: null,
    isDraftConversation: false,
    conversations: [],
    conversationsLoaded: false,
    mode: 'agent',
    model: 'MiniMax-M3',
    input: '',
    selectedChapters: [],
    submittedFormKeys: [],
    isLoadingMessages: false,
    loadMessagesError: null,
  }
}

export function createNovelChatActions(set: StoreSet, _get: StoreGet): NovelChatActions {
  return {
    setActiveNovelId: (novelId) => {
      set((state) => {
        state.novelChat.activeNovelId = novelId
      }, false, 'novelChat/setActiveNovelId')
    },

    mountSession: (novelId) => {
      set((state) => {
        if (!state.novelChat.mountedSessionNovelIds.includes(novelId)) {
          state.novelChat.mountedSessionNovelIds.push(novelId)
        }
      }, false, 'novelChat/mountSession')
    },

    ensureUiSession: (novelId) => {
      set((state) => {
        if (!state.novelChat.sessionsByNovelId[novelId]) {
          state.novelChat.sessionsByNovelId[novelId] = createDefaultUiSession()
        }
      }, false, 'novelChat/ensureUiSession')
    },

    patchUiSession: (novelId, patch) => {
      set((state) => {
        if (!state.novelChat.sessionsByNovelId[novelId]) {
          state.novelChat.sessionsByNovelId[novelId] = createDefaultUiSession()
        }
        applyPartialPatch(state.novelChat.sessionsByNovelId[novelId], patch)
      }, false, 'novelChat/patchUiSession')
    },

    resetUiSession: (novelId) => {
      set((state) => {
        state.novelChat.sessionsByNovelId[novelId] = createDefaultUiSession()
      }, false, 'novelChat/resetUiSession')
    },

    removeUiSession: (novelId) => {
      set((state) => {
        delete state.novelChat.sessionsByNovelId[novelId]
      }, false, 'novelChat/removeUiSession')
    },
  }
}
