import type { NextRequest } from 'next/server'
import { getApiKey } from '@/lib/api-key'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const POST = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const { id } = await params

    const { data: chapter, error } = await supabase
      .from('chapters')
      .select('content')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!chapter) throw new Error('章节不存在')

    const userApiKey = await getApiKey('default-user')
    if (!userApiKey && !process.env.SILICON_FLOW_API_KEY) {
      throw new Error('API Key 未配置')
    }

    const apiKey = userApiKey || process.env.SILICON_FLOW_API_KEY || ''
    const baseUrl = process.env.SILICON_FLOW_BASE_URL || 'https://api.siliconflow.cn/v1'
    const model = process.env.SILICON_FLOW_MODEL || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B'

    const systemPrompt = `你是一个专业的文学编辑。请为以下章节内容生成一段简洁的摘要（100-150字），概括主要情节和核心内容。

要求：
1. 直接返回摘要文本，不要添加任何标题或前缀
2. 不要使用 markdown 语法
3. 语言简洁流畅
4. 突出重点情节和关键信息
5. 每次生成时可以从不同角度切入，突出不同的重点内容`

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
            content: chapter.content,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
        enable_thinking: false,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`AI API 错误: ${error.error?.message || response.statusText}`)
    }

    const result = await response.json()
    const summary = result.choices?.[0]?.message?.content?.trim()

    if (!summary) {
      throw new Error('生成摘要失败')
    }

    return ApiResponseBuilder.success({ summary })
  },
)
