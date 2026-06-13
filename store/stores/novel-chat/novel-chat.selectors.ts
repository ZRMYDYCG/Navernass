import type { NovelChatStore } from './novel-chat.types'
import type { NovelChatUiSession } from './novel-chat.types'

export const selectNovelChat = (state: NovelChatStore) => state.novelChat
export const selectActiveNovelId = (state: NovelChatStore) => state.novelChat.activeNovelId
export const selectMountedSessionNovelIds = (state: NovelChatStore) => state.novelChat.mountedSessionNovelIds

export function selectNovelChatUiSession(
  state: NovelChatStore,
  novelId: string | null | undefined,
): NovelChatUiSession | null {
  if (!novelId) return null
  return state.novelChat.sessionsByNovelId[novelId] ?? null
}

export const selectUiSessionForNovel = (novelId: string) =>
  (state: NovelChatStore): NovelChatUiSession | null => state.novelChat.sessionsByNovelId[novelId] ?? null
