import type { AiMode, AiModel } from '@/app/(writing)/editor/_components/right-panel/types'
import type { NovelConversation } from '@/lib/supabase/sdk'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface NovelChatSelectedChapter {
  id: string
  title: string
}

export interface NovelChatSelectedCharacter {
  id: string
  name: string
}

export interface NovelChatUiSession {
  currentConversationId: string | null
  /** 用户主动新建对话后为 true，忽略旧请求的 X-Conversation-Id，直到下次发送 */
  isDraftConversation: boolean
  conversations: NovelConversation[]
  conversationsLoaded: boolean
  mode: AiMode
  model: AiModel
  input: string
  selectedChapters: NovelChatSelectedChapter[]
  submittedFormKeys: string[]
  isLoadingMessages: boolean
  loadMessagesError: string | null
}

interface NovelChatStoreState {
  activeNovelId: string | null
  mountedSessionNovelIds: string[]
  sessionsByNovelId: Record<string, NovelChatUiSession>

  setActiveNovelId: (novelId: string | null) => void
  mountSession: (novelId: string) => void
  ensureUiSession: (novelId: string) => void
  patchUiSession: (novelId: string, patch: Partial<NovelChatUiSession>) => void
  resetUiSession: (novelId: string) => void
  removeUiSession: (novelId: string) => void
}

function createDefaultUiSession(): NovelChatUiSession {
  return {
    currentConversationId: null,
    isDraftConversation: false,
    conversations: [],
    conversationsLoaded: false,
    mode: 'agent',
    model: 'MiniMax-M2.7',
    input: '',
    selectedChapters: [],
    submittedFormKeys: [],
    isLoadingMessages: false,
    loadMessagesError: null,
  }
}

export const useNovelChatStore = create<NovelChatStoreState>()(
  devtools(
    immer<NovelChatStoreState>(set => ({
      activeNovelId: null,
      mountedSessionNovelIds: [],
      sessionsByNovelId: {},

      setActiveNovelId: novelId => set((state) => {
        state.activeNovelId = novelId
      }),

      mountSession: novelId => set((state) => {
        if (!state.mountedSessionNovelIds.includes(novelId)) {
          state.mountedSessionNovelIds.push(novelId)
        }
      }),

      ensureUiSession: novelId => set((state) => {
        if (!state.sessionsByNovelId[novelId]) {
          state.sessionsByNovelId[novelId] = createDefaultUiSession()
        }
      }),

      patchUiSession: (novelId, patch) => set((state) => {
        if (!state.sessionsByNovelId[novelId]) {
          state.sessionsByNovelId[novelId] = createDefaultUiSession()
        }
        Object.assign(state.sessionsByNovelId[novelId], patch)
      }),

      resetUiSession: novelId => set((state) => {
        state.sessionsByNovelId[novelId] = createDefaultUiSession()
      }),

      removeUiSession: novelId => set((state) => {
        delete state.sessionsByNovelId[novelId]
      }),
    })),
    { name: 'novel-chat-store' },
  ),
)

export function selectNovelChatUiSession(
  state: NovelChatStoreState,
  novelId: string | null | undefined,
): NovelChatUiSession | null {
  if (!novelId) return null
  return state.sessionsByNovelId[novelId] ?? null
}
