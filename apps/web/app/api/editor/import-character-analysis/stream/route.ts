import type { UIMessage } from 'ai'
import type { NextRequest } from 'next/server'
import { convertToModelMessages } from 'ai'
import { bootstrapAgents } from '@/lib/ai/agents/bootstrap'
import { runCharacterImportAnalyzerAgent } from '@/lib/ai/agents/character-import-analyzer'
import { createClient } from '@/lib/supabase/server'

interface ImportAnalysisRequestBody {
  novelId: string
  importText: string
  chapterTitles?: string[]
  messages: UIMessage[]
  model?: string
}

bootstrapAgents()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = (await req.json()) as ImportAnalysisRequestBody
  const { novelId, importText, chapterTitles, messages, model } = body

  if (!novelId || !importText?.trim() || !messages?.length) {
    return new Response('novelId, importText and messages are required', { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const modelMessages = await convertToModelMessages(messages)

  const result = runCharacterImportAnalyzerAgent({
    uiMessages: messages,
    modelMessages,
    modelId: model,
    decision: {
      agentId: 'character-import-analyzer',
      skillIds: [],
      reason: 'import character analysis dedicated route',
    },
    importText: importText.trim(),
    chapterTitles,
    toolContext: {
      supabase,
      userId: user.id,
      novelId,
    },
    onFinish: async ({ text, usage }) => {
      console.log(
        '[character-import-analyzer/onFinish]',
        'text len:', text.length,
        'tokens:', usage?.totalTokens,
      )
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    originalMessages: messages,
    headers: {
      'X-Agent-Id': 'character-import-analyzer',
    },
  })
}

export const dynamic = 'force-dynamic'
