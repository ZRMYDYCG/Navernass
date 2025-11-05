import type { CreateMessageDto, Message } from './types'
import { apiClient } from './client'

export const messagesApi = {
  /**
   * 获取对话的所有消息
   */
  getByConversationId: async (conversationId: string): Promise<Message[]> => {
    return apiClient.get<Message[]>(`/api/conversations/${conversationId}/messages`)
  },

  /**
   * 创建消息
   */
  create: async (messageData: CreateMessageDto): Promise<Message> => {
    const { conversation_id, ...body } = messageData
    return apiClient.post<Message>(`/api/conversations/${conversation_id}/messages`, body)
  },

  /**
   * 删除消息
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/messages/${id}`)
  },

  /**
   * 清空对话的所有消息
   */
  clearByConversationId: async (conversationId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/conversations/${conversationId}/messages/clear`)
  },

  /**
   * 批量创建消息（用于导入对话历史）
   */
  createBatch: async (messages: CreateMessageDto[]): Promise<Message[]> => {
    return apiClient.post<Message[]>('/api/messages/batch', messages)
  },
}
