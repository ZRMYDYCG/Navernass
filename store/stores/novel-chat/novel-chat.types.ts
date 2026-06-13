import type { AiMode, AiModel } from '@/app/(writing)/editor/_components/right-panel/types'
import type { NovelConversation } from '@/lib/supabase/sdk'

export type NovelChatSelectedChapter = {
  id: string
  title: string
}

export type NovelChatSelectedCharacter = {
  id: string
  name: string
}

export type NovelChatUiSession = {
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

export type NovelChatState = {
  activeNovelId: string | null
  mountedSessionNovelIds: string[]
  sessionsByNovelId: Record<string, NovelChatUiSession>
}

export type NovelChatActions = {
  setActiveNovelId: (novelId: string | null) => void
  mountSession: (novelId: string) => void
  ensureUiSession: (novelId: string) => void
  patchUiSession: (novelId: string, patch: Partial<NovelChatUiSession>) => void
  resetUiSession: (novelId: string) => void
  removeUiSession: (novelId: string) => void
}

export type NovelChatStore = {
  novelChat: NovelChatState
  novelChatActions: NovelChatActions
}
