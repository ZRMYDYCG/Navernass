import type { SendMessageRequest, SendMessageResponse } from './types'
import { apiClient } from './client'

export const chatApi = {
  /**
   * 发送消息并获取AI回复
   */
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    return apiClient.post<SendMessageResponse>('/api/chat/send', data)
  },

  /**
   * 流式发送消息并获取AI回复
   */
  sendMessageStream: async (
    data: SendMessageRequest,
    callbacks: {
      onConversationId?: (id: string) => void
      onUserMessageId?: (id: string) => void
      onContent?: (content: string) => void
      onDone?: (data: { messageId: string, tokens: number, model: string }) => void
      onError?: (error: string) => void
    },
  ): Promise<void> => {
    const response = await fetch('/api/chat/stream', {
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
