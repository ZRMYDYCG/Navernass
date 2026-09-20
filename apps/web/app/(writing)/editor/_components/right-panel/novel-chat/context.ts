import type { UseChatHelpers } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import { createContext, useContext } from 'react'

type ChatStatus = UseChatHelpers<UIMessage>['status']

export interface NovelChatRuntime {
  novelId: string
  messages: UIMessage[]
  status: ChatStatus
  error: Error | undefined
  sendMessage: (message: { text: string }) => Promise<void>
  stop: () => Promise<void>
  setMessages: (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void
  loadMessages: (conversationId: string) => Promise<void>
  loadConversations: () => Promise<void>
}

export interface NovelChatContextValue {
  ensureSession: (novelId: string) => void
  getRuntime: (novelId: string) => NovelChatRuntime | undefined
  subscribeNovel: (novelId: string, listener: () => void) => () => void
  getRuntimeVersion: (novelId: string) => number
}

export const NovelChatContext = createContext<NovelChatContextValue | null>(null)

export function useNovelChatContext() {
  const ctx = useContext(NovelChatContext)
  if (!ctx) {
    throw new Error('useNovelChatContext must be used within NovelChatProvider')
  }
  return ctx
}
