import type { Conversation, CreateConversationDto, UpdateConversationDto } from './types'
import { apiClient } from './client'

export const conversationsApi = {
  /**
   * 获取所有对话
   */
  getList: async (): Promise<Conversation[]> => {
    return apiClient.get<Conversation[]>('/api/conversations')
  },

  /**
   * 获取对话详情
   */
  getById: async (id: string): Promise<Conversation> => {
    return apiClient.get<Conversation>(`/api/conversations/${id}`)
  },

  /**
   * 创建对话
   */
  create: async (conversationData: CreateConversationDto): Promise<Conversation> => {
    return apiClient.post<Conversation>('/api/conversations', conversationData)
  },

  /**
   * 更新对话
   */
  update: async (conversationData: UpdateConversationDto): Promise<Conversation> => {
    const { id, ...updates } = conversationData
    return apiClient.put<Conversation>(`/api/conversations/${id}`, updates)
  },

  /**
   * 删除对话
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/conversations/${id}`)
  },

  /**
   * 获取最近的对话列表
   */
  getRecent: async (limit: number = 10): Promise<Conversation[]> => {
    return apiClient.get<Conversation[]>('/api/conversations/recent', {
      params: { limit },
    })
  },
}
