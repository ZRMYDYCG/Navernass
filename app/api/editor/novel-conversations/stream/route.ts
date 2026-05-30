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

  // ✅ 先同步存"用户消息"（不依赖 onFinish）
  // 之前放到 toUIMessageStreamResponse.onFinish 里，部署在 Next.js 流式响应下
  // 经常因为函数生命周期早于 onFinish 被收束而不触发，导致 GET /messages 返回空。
  console.log('[stream] persisting user message...')
  let userMessageRow: any
  try {
    const lastInputUser = [...messages].reverse().find(m => m.role === 'user')
    userMessageRow = await messagesService.upsert({
      id: lastInputUser?.id || crypto.randomUUID(),
      conversation_id: conversation.id,
      novel_id: novelId,
      role: 'user',
      content: userInput,
      model: model || DEFAULT_LLM_MODEL,
      tokens: 0,
      parts: lastInputUser?.parts as unknown[] | undefined,
    })
    console.log('[stream] user message saved:', userMessageRow?.id)
  } catch (error) {
    console.error('[stream] FAILED to persist user message:', error)
    return new Response('Failed to persist user message', { status: 500 })
  }

  // 派发到 specialist agent
  // assistant 消息走"流内"持久化：在 streamText 的 onFinish（每个 step 完成时）
  // 收集 parts，最后由 toUIMessageStreamResponse.onFinish 兜底落库。
  let lastAssistantParts: unknown[] = []
  let lastAssistantText = ''
  let lastAssistantReasoning = ''
  let totalTokens = 0

  const result = runWriterAgent({
    uiMessages: messages,
    modelMessages,
    modelId: model,
    mode: mode || 'ask',
    decision,
    toolContext: {
      supabase,
      userId: user.id,
      novelId,
      conversationId: conversation.id,
      selectedChapterIds,
    },
    onFinish: async ({ text, reasoningText, usage }) => {
      lastAssistantText = text
      lastAssistantReasoning = reasoningText || ''
      totalTokens = usage?.totalTokens || 0
      console.log('[stream/streamText.onFinish] text len:', text.length, 'tokens:', totalTokens)
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    originalMessages: messages,
    onFinish: async ({ messages: finalMessages }) => {
      console.log('[stream/uiOnFinish] final messages count:', finalMessages.length)
      try {
        // 取生成的 assistant 消息（input messages 都是 user/assistant 历史，最后新增的是这次 stream 产物）
        const lastAssistant = [...finalMessages].reverse().find(m => m.role === 'assistant')
        if (!lastAssistant) {
          console.warn('[stream/uiOnFinish] no assistant message in finalMessages, fallback to streamText data')
          // 兜底：用 streamText.onFinish 的数据建一个最小 parts
          const fallbackParts: unknown[] = []
          if (lastAssistantReasoning) {
            fallbackParts.push({ type: 'reasoning', text: lastAssistantReasoning, state: 'done' })
          }
          if (lastAssistantText) {
            fallbackParts.push({ type: 'text', text: lastAssistantText, state: 'done' })
          }
          if (fallbackParts.length === 0) {
            console.warn('[stream/uiOnFinish] nothing to persist (empty assistant)')
            return
          }
          const saved = await messagesService.upsert({
            id: crypto.randomUUID(),
            conversation_id: conversation.id,
            novel_id: novelId,
            role: 'assistant',
            content: lastAssistantText,
            thinking: lastAssistantReasoning || undefined,
            model: model || DEFAULT_LLM_MODEL,
            tokens: totalTokens,
            parts: fallbackParts,
          })
          console.log('[stream/uiOnFinish] assistant fallback saved:', saved?.id)
          return
        }

        lastAssistantParts = (lastAssistant.parts || []) as unknown[]
        const partsCount = lastAssistantParts.length
        console.log('[stream/uiOnFinish] saving assistant, parts count:', partsCount)
        const saved = await messagesService.upsert({
          id: lastAssistant.id,
          conversation_id: conversation.id,
          novel_id: novelId,
          role: 'assistant',
          content: extractTextFromParts(lastAssistantParts) || lastAssistantText,
          thinking: extractReasoningFromParts(lastAssistantParts) || lastAssistantReasoning || undefined,
          model: model || DEFAULT_LLM_MODEL,
          tokens: totalTokens,
          parts: lastAssistantParts,
        })
        console.log('[stream/uiOnFinish] assistant saved:', saved?.id, 'parts persisted:', !!saved?.parts)
      } catch (error) {
        console.error('[stream/uiOnFinish] FAILED to persist assistant message:', error)
      }
    },
    headers: {
      'X-Conversation-Id': conversation.id,
      'X-Agent-Id': decision.agentId,
      'X-Ai-Mode': mode || 'ask',
      'X-Skill-Ids': decision.skillIds.join(','),
    },
  })
}

function extractTextFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) return ''
  return parts
    .filter((p: any) => p?.type === 'text' && typeof p.text === 'string')
    .map((p: any) => p.text as string)
    .join('')
}

function extractReasoningFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) return ''
  return parts
    .filter((p: any) => p?.type === 'reasoning' && typeof p.text === 'string')
    .map((p: any) => p.text as string)
    .join('\n')
}
