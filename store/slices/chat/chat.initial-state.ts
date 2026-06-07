import type { ChatState } from './chat.types'

export const chatInitialState: ChatState = {
  welcomeInput: '',
  pendingDraftMessage: null,
  streamingConversationId: null,
  welcomeMode: 'ask',
  welcomeModel: 'MiniMax-M3',
}
