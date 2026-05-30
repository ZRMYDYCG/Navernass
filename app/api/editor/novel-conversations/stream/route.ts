import type { UIMessage } from 'ai'
import type { NextRequest } from 'next/server'
import { convertToModelMessages } from 'ai'
import { bootstrapAgents, runWriterAgent, route, getAgent } from '@/lib/ai/agents'
import { DEFAULT_LLM_MODEL } from '@/lib/ai/minimax'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'
import { NovelConversationsService } from '@/lib/supabase/sdk/services/novel-conversations.service'
import { NovelMessagesService } from '@/lib/supabase/sdk/services/novel-messages.service'
import { createClient } from '@/lib/supabase/server'
import { buildChapterContext } from '@/prompts'

interface ChatRequestBody {
  novelId: string
  conversationId?: string
  messages: UIMessage[]
  selectedChapterIds?: string[]
  mode?: string
  model?: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

bootstrapAgents()

function pickLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== 'user') continue
    const text = (m.parts || [])
      .filter((p: any) => p?.type === 'text')
      .map((p: any) => p.text as string)
      .join('')
    if (text.trim().length > 0) return text
  }
  return ''
}

async function ensureConversation(
  service: NovelConversationsService,
  novelId: string,
  conversationId: string | undefined,
  firstMessage: string,
) {
  const valid = conversationId && UUID_RE.test(conversationId)
  if (valid) {
    try {
      const conv = await service.getById(conversationId!)
      if (conv.novel_id !== novelId) throw new Error('Conversation does not belong to this novel')
      return conv
    } catch {
      // fall through to create
    }
  }

  const title = firstMessage.length > 20 ? `${firstMessage.slice(0, 20)}...` : (firstMessage || '新对话')
  return service.create({ novel_id: novelId, title })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const conversationsService = new NovelConversationsService(supabase)
  const messagesService = new NovelMessagesService(supabase)
  const chaptersService = new ChaptersService(supabase)

  const body = (await req.json()) as ChatRequestBody
  const { novelId, conversationId, messages, selectedChapterIds, mode, model } = body

  if (!novelId || !messages || messages.length === 0) {
    return new Response('novelId and messages are required', { status: 400 })
  }

  const userInput = pickLastUserText(messages)
  if (!userInput) {
    return new Response('Message cannot be empty', { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const conversation = await ensureConversation(
    conversationsService,
    novelId,
    conversationId,
    userInput,
  )

  // 章节上下文
  let contextMessage = ''
  if (selectedChapterIds && selectedChapterIds.length > 0) {
    try {
      const chapters = await Promise.all(
        selectedChapterIds.map(id => chaptersService.getById(id)),
      )
      contextMessage = buildChapterContext(chapters)
    } catch (error) {
      console.warn('Failed to load selected chapters:', error)
    }
  }

  // Router 决策：派给哪个 agent + 启用哪些 skill
  const decision = route({ text: userInput, mode: mode || 'ask' })
  const agent = getAgent(decision.agentId)
  if (!agent) {
    return new Response(`Unknown agent: ${decision.agentId}`, { status: 500 })
  }

  // 持久化用户消息
  await messagesService.create({
    conversation_id: conversation.id,
    novel_id: novelId,
    role: 'user',
    content: userInput,
    model: model || DEFAULT_LLM_MODEL,
    tokens: 0,
  })

  // 构建 model messages（注入章节上下文到最后一条 user message）
  const modelMessages = await convertToModelMessages(messages)
  if (contextMessage && modelMessages.length > 0) {
    const last = modelMessages[modelMessages.length - 1]
    if (last.role === 'user' && typeof last.content === 'string') {
      last.content = `${contextMessage}用户问题：${last.content}`
    } else if (last.role === 'user' && Array.isArray(last.content)) {
      last.content = [
        { type: 'text', text: contextMessage } as any,
        ...last.content,
      ]
    }
  }

  // 派发到 specialist agent
  const result = runWriterAgent({
    uiMessages: messages,
    modelMessages,
    modelId: model,
    decision,
    toolContext: {
      supabase,
      userId: user.id,
      novelId,
      conversationId: conversation.id,
      selectedChapterIds,
    },
    onFinish: async ({ text, reasoningText, usage }) => {
      try {
        await messagesService.create({
          conversation_id: conversation.id,
          novel_id: novelId,
          role: 'assistant',
          content: text,
          thinking: reasoningText || undefined,
          model: model || DEFAULT_LLM_MODEL,
          tokens: usage?.totalTokens || 0,
        })
      } catch (error) {
        console.error('Failed to persist assistant message:', error)
      }
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    headers: {
      'X-Conversation-Id': conversation.id,
      'X-Agent-Id': decision.agentId,
      'X-Skill-Ids': decision.skillIds.join(','),
    },
  })
}
