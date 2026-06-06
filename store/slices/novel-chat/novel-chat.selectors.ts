import type { AppStore } from '../../store.types'
import type { NovelChatUiSession } from './novel-chat.types'

export const selectNovelChat = (state: AppStore) => state.novelChat
export const selectActiveNovelId = (state: AppStore) => state.novelChat.activeNovelId
export const selectMountedSessionNovelIds = (state: AppStore) => state.novelChat.mountedSessionNovelIds

export function selectNovelChatUiSession(
  state: AppStore,
  novelId: string | null | undefined,
): NovelChatUiSession | null {
  if (!novelId) return null
  return state.novelChat.sessionsByNovelId[novelId] ?? null
}

export const selectUiSessionForNovel = (novelId: string) =>
  (state: AppStore): NovelChatUiSession | null => state.novelChat.sessionsByNovelId[novelId] ?? null
