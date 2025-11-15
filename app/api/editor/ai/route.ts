import type { NextRequest } from 'next/server'

interface EditorAIRequest {
  action: 'improve' | 'fix' | 'shorter' | 'longer' | 'translate' | 'continue' | 'custom'
  text: string
  prompt?: string // 用于 custom 操作
  context?: string // 可选：前后文上下文
}

/**
 * POST /api/editor/ai
 * 编辑器专用的 AI 助手接口 - 流式响应
 */
export async function POST(req: NextRequest) {
  const body: EditorAIRequest = await req.json()
  const { action, text, prompt, context } = body

  if (!text || text.trim().length === 0) {
    return new Response('Text cannot be empty', { status: 400 })
  }

  // 根据操作类型生成系统提示词
  const systemPrompts: Record<string, string> = {
    improve: '你是一个专业的写作助手。请改进以下文本，使其更清晰、流畅、专业，保持原意但提升表达质量。只返回改进后的文本，不要添加任何解释或额外内容。',
    fix: '你是一个专业的文字编辑。请修正以下文本的语法、标点、拼写错误，使其更加规范。只返回修正后的文本，不要添加任何解释。',
    shorter: '你是一个专业的编辑。请将以下文本缩短，保留核心信息和要点，使其更加简洁。只返回精简后的文本。',
    longer: '你是一个创意写作助手。请扩展以下文本，增加更多细节、描述和内容，使其更加丰富和生动。只返回扩展后的文本。',
    translate: '你是一个专业的翻译。请将以下中文翻译成英文，或将英文翻译成中文。保持原意和语气，使翻译自然流畅。只返回翻译结果。',
    continue: '你是一个创意写作助手。请根据以下内容自然地续写，保持相同的写作风格和语气。只返回续写的内容，不要重复原文。',
    custom: prompt || '你是一个专业的写作助手。',
  }

  const systemPrompt = systemPrompts[action] || systemPrompts.custom

  // 构建用户消息
  let userMessage = text
  if (context) {
    userMessage = `上下文：\n${context}\n\n要处理的文本：\n${text}`
  }

  // 创建流式响应
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const apiKey = process.env.SILICON_FLOW_API_KEY || ''
        const baseUrl = process.env.SILICON_FLOW_BASE_URL || 'https://api.siliconflow.cn/v1'
        const model = process.env.SILICON_FLOW_MODEL || 'deepseek-chat'

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
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
