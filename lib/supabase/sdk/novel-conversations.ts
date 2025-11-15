import type { CreateNovelConversationDto, NovelConversation, NovelMessage, SendNovelMessageRequest, UpdateNovelConversationDto } from './types'
import { apiClient } from './client'

export const novelConversationsApi = {
  /**
   * 获取小说的所有会话
   */
  getByNovelId: async (novelId: string): Promise<NovelConversation[]> => {
    return apiClient.get<NovelConversation[]>(`/api/editor/novel-conversations?novelId=${novelId}`)
  },

  /**
   * 获取会话详情
   */
  getById: async (id: string): Promise<NovelConversation> => {
    return apiClient.get<NovelConversation>(`/api/editor/novel-conversations/${id}`)
  },

  /**
   * 创建新会话
   */
  create: async (data: CreateNovelConversationDto): Promise<NovelConversation> => {
    return apiClient.post<NovelConversation>('/api/editor/novel-conversations', data)
  },

  /**
   * 更新会话
   */
  update: async (id: string, data: Partial<UpdateNovelConversationDto>): Promise<NovelConversation> => {
    return apiClient.patch<NovelConversation>(`/api/editor/novel-conversations/${id}`, data)
  },

  /**
   * 删除会话
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/editor/novel-conversations/${id}`)
  },

  /**
   * 获取会话的所有消息
   */
  getMessages: async (conversationId: string): Promise<NovelMessage[]> => {
    return apiClient.get<NovelMessage[]>(`/api/editor/novel-conversations/${conversationId}/messages`)
  },

  /**
   * 流式发送消息并获取AI回复
   */
  sendMessageStream: async (
    data: SendNovelMessageRequest,
    callbacks: {
      onConversationId?: (id: string) => void
      onUserMessageId?: (id: string) => void
      onContent?: (content: string) => void
      onDone?: (data: { messageId: string, tokens: number, model: string }) => void
      onError?: (error: string) => void
    },
  ): Promise<void> => {
    const response = await fetch('/api/editor/novel-conversations/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No response body')
    }

    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

        try {
          const jsonStr = trimmedLine.slice(6)
          const event = JSON.parse(jsonStr)

          switch (event.type) {
            case 'conversation_id':
              callbacks.onConversationId?.(event.data)
              break
            case 'user_message_id':
              callbacks.onUserMessageId?.(event.data)
              break
            case 'content':
              callbacks.onContent?.(event.data)
              break
            case 'done':
              callbacks.onDone?.(event.data)
              break
            case 'error':
              callbacks.onError?.(event.data)
              break
          }
        } catch {
          console.warn('Failed to parse SSE event:', trimmedLine)
        }
      }
    }
  },
}
