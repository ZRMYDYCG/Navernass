import type { UIMessage } from 'ai'
import type { NextRequest } from 'next/server'
import { after } from 'next/server'
import { consumeStream, convertToModelMessages } from 'ai'
import { bootstrapAgents, runWriterAgent, route, getAgent } from '@/lib/ai/agents'
import { DEFAULT_LLM_MODEL } from '@/lib/ai/minimax'
import {
  sanitizeUIMessagePartsForDisplay,
  sanitizeUIMessagesForModel,
  stripToolPartsFromMessages,
} from '@/lib/ai/sanitize-ui-messages'
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
  let modelMessages
  try {
    const sanitized = sanitizeUIMessagesForModel(messages)
    modelMessages = await convertToModelMessages(sanitized)
  } catch (error) {
    console.warn('[stream] convertToModelMessages failed after sanitize, fallback to text-only:', error)
    modelMessages = await convertToModelMessages(stripToolPartsFromMessages(messages))
  }
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

  // 预建 assistant 占位行，便于流中断后 GET /messages 仍能恢复部分内容
  const assistantMessageId = crypto.randomUUID()
  let accumulatedText = ''
  let accumulatedReasoning = ''
  let totalTokens = 0

  const persistAssistantPartial = async (opts?: { parts?: unknown[], force?: boolean }) => {
    const parts = opts?.parts ?? buildPartialParts(accumulatedReasoning, accumulatedText)
    if (!opts?.force && parts.length === 0) return
    try {
      await messagesService.upsert({
        id: assistantMessageId,
        conversation_id: conversation.id,
        novel_id: novelId,
        role: 'assistant',
        content: accumulatedText,
        thinking: accumulatedReasoning || undefined,
        model: model || DEFAULT_LLM_MODEL,
        tokens: totalTokens,
        parts,
      })
    } catch (error) {
      console.error('[stream] partial assistant persist failed:', error)
    }
  }

  try {
    await messagesService.upsert({
      id: assistantMessageId,
      conversation_id: conversation.id,
      novel_id: novelId,
      role: 'assistant',
      content: '',
      model: model || DEFAULT_LLM_MODEL,
      tokens: 0,
      parts: [],
    })
    console.log('[stream] assistant placeholder created:', assistantMessageId)
  } catch (error) {
    console.error('[stream] FAILED to create assistant placeholder:', error)
  }

  // 派发到 specialist agent
  // assistant 分步落库（onStepFinish）+ 流结束兜底（ui onFinish）
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
    onStepFinish: ({ text, reasoningText }) => {
      if (reasoningText) {
        accumulatedReasoning = accumulatedReasoning
          ? `${accumulatedReasoning}\n${reasoningText}`
          : reasoningText
      }
      if (text) accumulatedText += text
      console.log('[stream/onStepFinish] text len:', accumulatedText.length, 'reasoning len:', accumulatedReasoning.length)
      void persistAssistantPartial()
    },
    onFinish: async ({ text, reasoningText, usage }) => {
      if (text) accumulatedText = text
      if (reasoningText) accumulatedReasoning = reasoningText
      totalTokens = usage?.totalTokens || 0
      console.log('[stream/streamText.onFinish] text len:', accumulatedText.length, 'tokens:', totalTokens)
      await persistAssistantPartial({ force: true })
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    originalMessages: messages,
    generateMessageId: () => assistantMessageId,
    consumeSseStream: ({ stream }) => {
      // 立即在后台消费 SSE 副本，与客户端并行拉流，减轻客户端停读时的反压
      void consumeStream({
        stream,
        onError: (error) => {
          console.error('[stream/consumeSseStream] error:', error)
        },
      })
        .then(() => console.log('[stream/consumeSseStream] background consume finished'))
        .catch((error) => console.error('[stream/consumeSseStream] failed:', error))
    },
    onFinish: async ({ messages: finalMessages, isAborted }) => {
      console.log('[stream/uiOnFinish] final messages count:', finalMessages.length, 'isAborted:', isAborted)
      try {
        const lastAssistant = [...finalMessages].reverse().find(m => m.role === 'assistant')
        if (!lastAssistant) {
          console.warn('[stream/uiOnFinish] no assistant in finalMessages, using accumulated fallback')
          await persistAssistantPartial({ force: true })
          return
        }

        const rawParts = (lastAssistant.parts || []) as unknown[]
        const displayParts = sanitizeUIMessagePartsForDisplay(rawParts)
        accumulatedText = extractTextFromParts(displayParts) || accumulatedText
        accumulatedReasoning = extractReasoningFromParts(displayParts) || accumulatedReasoning
        console.log('[stream/uiOnFinish] saving assistant, parts count:', displayParts.length)
        const saved = await messagesService.upsert({
          id: assistantMessageId,
          conversation_id: conversation.id,
          novel_id: novelId,
          role: 'assistant',
          content: accumulatedText,
          thinking: accumulatedReasoning || undefined,
          model: model || DEFAULT_LLM_MODEL,
          tokens: totalTokens,
          parts: displayParts.length > 0 ? displayParts : buildPartialParts(accumulatedReasoning, accumulatedText),
        })
        console.log('[stream/uiOnFinish] assistant saved:', saved?.id)
      } catch (error) {
        console.error('[stream/uiOnFinish] FAILED to persist assistant message:', error)
        await persistAssistantPartial({ force: true })
      }
    },
    onError: (error) => {
      console.error('[stream/uiOnError]', error)
      after(async () => {
        await persistAssistantPartial({ force: true })
      })
      return 'An error occurred.'
    },
    headers: {
      'X-Conversation-Id': conversation.id,
      'X-Agent-Id': decision.agentId,
      'X-Ai-Mode': mode || 'ask',
      'X-Skill-Ids': decision.skillIds.join(','),
    },
  })
}

function buildPartialParts(reasoning: string, text: string): unknown[] {
  const parts: unknown[] = []
  if (reasoning.trim()) {
    parts.push({ type: 'reasoning', text: reasoning, state: 'done' })
  }
  if (text.trim()) {
    parts.push({ type: 'text', text, state: 'done' })
  }
  return parts
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
