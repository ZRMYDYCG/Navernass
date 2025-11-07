import type { ChatMessage } from '../types'

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

  constructor() {
    this.apiKey = process.env.SILICON_FLOW_API_KEY || ''
    this.baseUrl = process.env.SILICON_FLOW_BASE_URL || 'https://api.siliconflow.cn/v1'
    this.model = process.env.SILICON_FLOW_MODEL || 'deepseek-chat'

    if (!this.apiKey) {
      console.warn('SILICON_FLOW_API_KEY is not set')
    }
  }

  /**
   * 发送消息到硅基流动API
   */
  async chat(messages: ChatMessage[]): Promise<{
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

      // 添加系统提示词
      siliconMessages.unshift({
        role: 'system',
        content: '你是一个专业的小说创作助手，擅长帮助用户构思情节、塑造角色、续写故事。请用温暖、鼓励的语气与用户交流，提供有创意的建议。',
      })

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
   */
  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: { content: string, tokens?: number, model?: string }) => void,
  ): Promise<void> {
    try {
      // 转换消息格式
      const siliconMessages: SiliconFlowMessage[] = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }))

      // 添加系统提示词
      siliconMessages.unshift({
        role: 'system',
        content: '你是一个专业的小说创作助手，擅长帮助用户构思情节、塑造角色、续写故事。请用温暖、鼓励的语气与用户交流，提供有创意的建议。',
      })

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
              content: '你是一个专业的小说创作助手。请根据用户的第一条消息，生成一个简洁、准确的对话标题（不超过20个字）。只需要返回标题，不需要任何其他内容。',
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
