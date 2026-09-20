import type { NovelChatState } from './novel-chat.types'

export const novelChatInitialState: NovelChatState = {
  activeNovelId: null,
  mountedSessionNovelIds: [],
  sessionsByNovelId: {},
}
