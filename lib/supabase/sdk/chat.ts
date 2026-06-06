import type { Message } from './types'
import { apiClient } from './client'

export const chatApi = {
  /**
   * 加载会话历史消息（useChat 重构后供前端 useChat.setMessages 用）
   *
   * 旧 sendMessage / sendMessageStream 已弃用 —— useChat 直接消费 AI SDK v6
   * 的 UIMessageStreamResponse，messages 通过新的 /api/chat/stream 传输。
   */
  getMessages: async (conversationId: string): Promise<Message[]> => {
    return apiClient.get<Message[]>(`/api/chat/conversations/${conversationId}/messages`)
  },
}
