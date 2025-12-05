import type { ChatMessage } from '../types'
import { getChatPrompt, TITLE_GENERATION_PROMPT } from '@/prompts'

interface SiliconFlowMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface SiliconFlowResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class SiliconFlowService {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SILICON_FLOW_API_KEY || ''
    this.baseUrl = process.env.SILICON_FLOW_BASE_URL || 'https://api.siliconflow.cn/v1'
    this.model = process.env.SILICON_FLOW_MODEL || 'deepseek-chat'

    if (!this.apiKey) {
      console.warn('SILICON_FLOW_API_KEY is not set')
    }
  }

  /**
   * 发送消息到硅基流动API
   * @param messages 消息列表
   * @param systemPrompt 可选的系统提示词，如果不提供则使用默认的聊天提示词
   */
  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<{
    content: string
    tokens: number
    model: string
  }> {
    try {
      // 转换消息格式
      const siliconMessages: SiliconFlowMessage[] = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }))

      // 检查是否已有系统消息，如果没有则添加
      const hasSystemMessage = siliconMessages.some(msg => msg.role === 'system')
      if (!hasSystemMessage) {
        const prompt = systemPrompt || getChatPrompt('default')
        siliconMessages.unshift({
          role: 'system',
          content: prompt,
        })
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: siliconMessages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`SiliconFlow API error: ${error.error?.message || response.statusText}`)
      }

      const data: SiliconFlowResponse = await response.json()

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from SiliconFlow API')
      }

      return {
        content: data.choices[0].message.content,
        tokens: data.usage.total_tokens,
        model: data.model,
      }
    } catch (error) {
      console.error('SiliconFlow API error:', error)
      throw error
    }
  }

  /**
   * 流式发送消息到硅基流动API
   * @param messages 消息列表（如果已包含system消息，则不会重复添加）
   * @param onChunk 流式数据回调
   * @param systemPrompt 可选的系统提示词，如果不提供且消息中没有system消息，则使用默认的聊天提示词
   */
  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: { content: string, tokens?: number, model?: string }) => void,
    systemPrompt?: string,
  ): Promise<void> {
    try {
      // 转换消息格式
      const siliconMessages: SiliconFlowMessage[] = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }))

      // 检查是否已有系统消息，如果没有则添加
      const hasSystemMessage = siliconMessages.some(msg => msg.role === 'system')
      if (!hasSystemMessage) {
        const prompt = systemPrompt || getChatPrompt('default')
        siliconMessages.unshift({
          role: 'system',
          content: prompt,
        })
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: siliconMessages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: true, // 启用流式输出
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`SiliconFlow API error: ${error.error?.message || response.statusText}`)
      }

      // 处理流式响应
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
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6)
              const data = JSON.parse(jsonStr)

              if (data.choices && data.choices[0]?.delta?.content) {
                onChunk({
                  content: data.choices[0].delta.content,
                  model: data.model,
                  tokens: data.usage?.total_tokens,
                })
              }
            } catch {
              // 忽略解析错误
              console.warn('Failed to parse SSE data:', trimmedLine)
            }
          }
        }
      }
    } catch (error) {
      console.error('SiliconFlow Stream API error:', error)
      throw error
    }
  }

  /**
   * 生成对话标题
   */
  async generateTitle(firstMessage: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: TITLE_GENERATION_PROMPT,
            },
            {
              role: 'user',
              content: firstMessage,
            },
          ],
          temperature: 0.5,
          max_tokens: 50,
        }),
      })

      if (!response.ok) {
        return '新对话'
      }

      const data: SiliconFlowResponse = await response.json()
      const title = data.choices[0]?.message?.content?.trim() || '新对话'

      // 限制标题长度
      return title.length > 20 ? `${title.substring(0, 20)}...` : title
    } catch (error) {
      console.error('Error generating title:', error)
      return '新对话'
    }
  }
}
