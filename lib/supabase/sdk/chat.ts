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

  /**
   * 持久化某条消息里某个 part 的 output（按 toolCallId 定位）
   *
   * 用于：
   *   - 桥接工具 (propose_novel/character/outline) 的 accept / reject
   *   - ask_user 表单提交后把 submitted 状态落到 part.output
   *
   * 客户端不需要先查 messageId —— 服务端会按 (conversationId, toolCallId)
   * 找第一条含此 toolCallId 的 part 并 merge output。
   */
  updatePartOutput: async (params: {
    conversationId: string
    toolCallId: string
    output: unknown
  }): Promise<{ messageId: string, partIndex: number }> => {
    return apiClient.patch<{ messageId: string, partIndex: number }>(
      '/api/chat/messages/update-part',
      params,
    )
  },
}
