import type { UIMessage } from 'ai'
import type { NextRequest } from 'next/server'
import { convertToModelMessages } from 'ai'
import { bootstrapAgents } from '@/lib/ai/agents'
import { runCharacterScriptwriterAgent } from '@/lib/ai/agents/character-scriptwriter'
import { DEFAULT_LLM_MODEL } from '@/lib/ai/minimax'
import { createClient } from '@/lib/supabase/server'

interface CharacterScriptRequestBody {
  novelId: string
  characterId: string
  characterName?: string
  messages: UIMessage[]
  model?: string
}

bootstrapAgents()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = (await req.json()) as CharacterScriptRequestBody
  const { novelId, characterId, characterName, messages, model } = body

  if (!novelId || !characterId || !messages || messages.length === 0) {
    return new Response('novelId, characterId and messages are required', { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const modelMessages = await convertToModelMessages(messages)

  const result = runCharacterScriptwriterAgent({
    uiMessages: messages,
    modelMessages,
    modelId: model,
    decision: {
      agentId: 'character-scriptwriter',
      skillIds: ['chinese-novel-style'],
      reason: 'character-scriptwriter dedicated route',
    },
    characterId,
    characterName,
    toolContext: {
      supabase,
      userId: user.id,
      novelId,
      characterId,
    },
    onFinish: async ({ text, usage }) => {
      console.log(
        '[character-scriptwriter/onFinish]',
        'text len:', text.length,
        'tokens:', usage?.totalTokens,
      )
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    originalMessages: messages,
    onFinish: async ({ messages: finalMessages }) => {
      // 角色剧本对话不持久化历史（用户每次浮窗对话是临时的）
      // 后续如要持久化，可在这里 upsert 一张 character_conversations 表
      console.log('[character-scriptwriter/uiOnFinish] msgs:', finalMessages.length)
    },
    headers: {
      'X-Agent-Id': 'character-scriptwriter',
      'X-Character-Id': characterId,
    },
  })
}

// 让此 route 不要因为构建预渲染失败
export const dynamic = 'force-dynamic'
