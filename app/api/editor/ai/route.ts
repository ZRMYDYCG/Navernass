import type { NextRequest } from 'next/server'
import { getApiKey } from '@/lib/api-key'
import { getEditorPrompt } from '@/prompts'

interface EditorAIRequest {
  action: 'improve' | 'fix' | 'shorter' | 'longer' | 'translate' | 'continue' | 'custom'
  text: string
  prompt?: string
  context?: string
  model?: string
}

/**
 * POST /api/editor/ai
 * 编辑器专用的 AI 助手接口 - 流式响应
 */
export async function POST(req: NextRequest) {
  const body: EditorAIRequest = await req.json()
  const { action, text, prompt, context, model } = body

  if (!text || text.trim().length === 0) {
    return new Response('Text cannot be empty', { status: 400 })
  }

  const userApiKey = await getApiKey('default-user')
  if (!userApiKey && !process.env.SILICON_FLOW_API_KEY) {
    return new Response('API Key not configured', { status: 400 })
  }

  // 根据操作类型生成系统提示词
  const systemPrompt = getEditorPrompt(action, prompt)

  // 构建用户消息
  let userMessage = text
  if (context) {
    userMessage = `上下文：\n${context}\n\n要处理的文本：\n${text}`
  }

  // 创建流式响应
  const encoder = new TextEncoder()
  const apiKey = userApiKey || process.env.SILICON_FLOW_API_KEY || ''
  const baseUrl = process.env.SILICON_FLOW_BASE_URL || 'https://api.siliconflow.cn/v1'
  const selectedModel = model || process.env.SILICON_FLOW_MODEL || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B'

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: userMessage,
              },
            ],
            temperature: action === 'fix' ? 0.3 : 0.7,
            max_tokens: action === 'shorter' ? 1000 : 3000,
            stream: true,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`AI API error: ${error.error?.message || response.statusText}`)
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
                  const content = data.choices[0].delta.content
                  // 发送内容块
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'content', data: content })}\n\n`),
                  )
                }
              } catch (error: any) {
                console.warn('Failed to parse SSE data:', trimmedLine, error)
              }
            }
          }
        }

        // 发送完成信号
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`),
        )
        controller.close()
      } catch (error: any) {
        console.error('Editor AI Stream error:', error)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', data: error.message })}\n\n`),
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
