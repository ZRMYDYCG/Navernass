import type { UIMessage } from 'ai'
import type { NextRequest } from 'next/server'
import { bootstrapAgents, runSelectionEditorAgent } from '@/lib/ai/agents'
import { hasMinimaxApiKey } from '@/lib/ai/minimax'
import { createClient } from '@/lib/supabase/server'
import type { EditorAction } from '@/prompts/editor'

interface SelectionAIRequestBody {
  action: EditorAction
  selectedText: string
  customPrompt?: string
  context?: string
  messages: UIMessage[]
  model?: string
}

bootstrapAgents()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = (await req.json()) as SelectionAIRequestBody
  const { action, selectedText, customPrompt, context, messages, model } = body

  if (!selectedText?.trim()) {
    return new Response('selectedText is required', { status: 400 })
  }

  if (!messages?.length) {
    return new Response('messages is required', { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!hasMinimaxApiKey()) {
    return new Response('LLM API Key not configured', { status: 400 })
  }

  const resolvedAction: EditorAction = action || 'custom'
  let userContent = selectedText.trim()
  if (context?.trim()) {
    userContent = `上下文：\n${context.trim()}\n\n要处理的文本：\n${userContent}`
  }

  const result = runSelectionEditorAgent({
    action: resolvedAction,
    customPrompt,
    modelMessages: [{ role: 'user', content: userContent }],
    modelId: model,
    onFinish: async ({ text, usage }: { text: string, usage?: { totalTokens?: number } }) => {
      console.log(
        '[selection-editor/onFinish]',
        'action:', resolvedAction,
        'text len:', text.length,
        'tokens:', usage?.totalTokens,
      )
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: false,
    originalMessages: messages,
    headers: {
      'X-Agent-Id': 'selection-editor',
    },
  })
}

export const dynamic = 'force-dynamic'
