import type { UIMessage } from 'ai'
import type { NextRequest } from 'next/server'
import { after } from 'next/server'
import { convertToModelMessages } from 'ai'
import {
  bootstrapAgents,
  getAgent,
  routeChat,
  runChatSpecialistAgent,
} from '@/lib/ai/agents'
import { DEFAULT_LLM_MODEL, getMinimaxModel, hasMinimaxApiKey } from '@/lib/ai/minimax'
import { sanitizeUIMessagesForModel, stripToolPartsFromMessages } from '@/lib/ai/sanitize-ui-messages'
import { ConversationsService } from '@/lib/supabase/sdk/services/conversations.service'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { createClient } from '@/lib/supabase/server'

interface ChatRequestBody {
  conversationId?: string
  messages: UIMessage[]
  mode?: string
  model?: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

bootstrapAgents()

function pickLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== 'user') continue
    const parts = m.parts || []
    const merged = parts
      .filter((p) => (p as { type?: string }).type === 'text' && typeof (p as { text?: string }).text === 'string')
      .map((p) => (p as { text: string }).text)
      .join('')
    if (merged.trim().length > 0) return merged
  }
  return ''
}

async function ensureConversation(
  service: ConversationsService,
  conversationId: string | undefined,
  firstMessage: string,
  initialMode: string,
  initialModel: string,
) {
  const valid = conversationId && UUID_RE.test(conversationId)
  if (valid) {
    try {
      return await service.getById(conversationId!)
    } catch {
      // fall through to create
    }
  }

  const title = firstMessage.length > 20 ? `${firstMessage.slice(0, 20)}...` : (firstMessage || '新对话')
  return service.create({ title, mode: initialMode, model: initialModel })
}

export async function POST(req: NextRequest) {
  if (!hasMinimaxApiKey()) {
    return new Response('LLM_API_KEY is not configured', { status: 500 })
  }

  const supabase = await createClient()
  const conversationsService = new ConversationsService(supabase)
  const messagesService = new MessagesService(supabase)

  const body = (await req.json()) as ChatRequestBody
  const { conversationId, messages, mode: requestedMode, model } = body

  if (!messages || messages.length === 0) {
    return new Response('messages are required', { status: 400 })
  }

  const userInput = pickLastUserText(messages)
  if (!userInput) {
    return new Response('Message cannot be empty', { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 决定 mode：优先用请求里的 mode（可能是用户在前端刚切换的），
  // 否则用 conversation 行已存的 mode，最后兜底 ask。
  let resolvedMode = requestedMode || 'ask'
  if (!requestedMode && conversationId && UUID_RE.test(conversationId)) {
    try {
      const existing = await conversationsService.getById(conversationId)
      if (existing?.mode) resolvedMode = existing.mode
    } catch {
      /* fall through */
    }
  }

  const conversation = await ensureConversation(
    conversationsService,
    conversationId,
    userInput,
    resolvedMode,
    model || DEFAULT_LLM_MODEL,
  )

  // 首次创建会话时：异步生成标题 + 把请求里的 mode/model 落库（ensureConversation 已写入，
  // 但若 conversationId 命中已有 row 且 mode 不一致则覆盖一次）
  if (requestedMode && conversation.mode !== requestedMode) {
    try {
      await conversationsService.update(conversation.id, { mode: requestedMode, model: model || DEFAULT_LLM_MODEL })
      conversation.mode = requestedMode
      if (model) conversation.model = model
    } catch (err) {
      console.warn('[chat/stream] failed to persist mode on update:', err)
    }
  }

  // 构建 model messages
  let modelMessages
  try {
    const sanitized = sanitizeUIMessagesForModel(messages)
    modelMessages = await convertToModelMessages(sanitized)
  } catch (error) {
    console.warn('[chat/stream] convertToModelMessages failed after sanitize, fallback to text-only:', error)
    modelMessages = await convertToModelMessages(stripToolPartsFromMessages(messages))
  }

  // 先同步存"用户消息"
  let lastInputUser: UIMessage | undefined
  try {
    lastInputUser = [...messages].reverse().find(m => m.role === 'user')
    await messagesService.upsert({
      id: lastInputUser?.id || crypto.randomUUID(),
      conversation_id: conversation.id,
      role: 'user',
      content: userInput,
      model: model || DEFAULT_LLM_MODEL,
      tokens: 0,
      parts: lastInputUser?.parts as unknown[] | undefined,
    })
  } catch (error) {
    console.error('[chat/stream] FAILED to persist user message:', error)
    return new Response('Failed to persist user message', { status: 500 })
  }

  // 首次创建会话时异步生成标题
  if (conversation.created_at === conversation.updated_at) {
    after(async () => {
      try {
        const title = await generateTitle(userInput)
        if (title) {
          await conversationsService.update(conversation.id, { title })
        }
      } catch (err) {
        console.warn('[chat/stream] failed to generate title:', err)
      }
    })
  }

  // 预建 assistant 占位行
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
        role: 'assistant',
        content: accumulatedText,
        thinking: accumulatedReasoning || undefined,
        model: model || DEFAULT_LLM_MODEL,
        tokens: totalTokens,
        parts,
      })
    } catch (error) {
      console.error('[chat/stream] partial assistant persist failed:', error)
    }
  }

  try {
    await messagesService.upsert({
      id: assistantMessageId,
      conversation_id: conversation.id,
      role: 'assistant',
      content: '',
      model: model || DEFAULT_LLM_MODEL,
      tokens: 0,
      parts: [],
    })
  } catch (error) {
    console.error('[chat/stream] FAILED to create assistant placeholder:', error)
  }

  // Router 决策：按 chat mode 派发到 chat 专用 specialist
  const decision = routeChat({ text: userInput, mode: resolvedMode })
  const agent = getAgent(decision.agentId)
  if (!agent) {
    return new Response(`Unknown chat agent: ${decision.agentId}`, { status: 500 })
  }

  // 按 router 派发到 chat specialist
  const result = runChatSpecialistAgent({
    uiMessages: messages,
    modelMessages,
    modelId: model,
    mode: resolvedMode,
    agentId: decision.agentId,
    userText: userInput,
    decision,
    toolContext: {
      supabase,
      userId: user.id,
      // Chat 页没有"当前聚焦小说"——桥接工具的 novelId 来自 tool call input
      novelId: '',
      conversationId: conversation.id,
    },
    onStepFinish: ({ text, reasoningText }) => {
      if (reasoningText) {
        accumulatedReasoning = accumulatedReasoning
          ? `${accumulatedReasoning}\n${reasoningText}`
          : reasoningText
      }
      if (text) accumulatedText += text
      void persistAssistantPartial()
    },
    onFinish: async ({ text, reasoningText, usage }) => {
      if (text) accumulatedText = text
      if (reasoningText) accumulatedReasoning = reasoningText
      totalTokens = usage?.totalTokens || 0
      await persistAssistantPartial({ force: true })
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    originalMessages: messages,
    generateMessageId: () => assistantMessageId,
    onFinish: async ({ messages: finalMessages, isAborted }) => {
      try {
        const lastAssistant = [...finalMessages].reverse().find(m => m.role === 'assistant')
        if (!lastAssistant) {
          await persistAssistantPartial({ force: true })
          return
        }

        const rawParts = (lastAssistant.parts || []) as unknown[]
        const text = extractTextFromParts(rawParts)
        const reasoning = extractReasoningFromParts(rawParts)
        accumulatedText = text || accumulatedText
        accumulatedReasoning = reasoning || accumulatedReasoning

        const parts = rawParts.length > 0 ? rawParts : buildPartialParts(accumulatedReasoning, accumulatedText)
        await messagesService.upsert({
          id: assistantMessageId,
          conversation_id: conversation.id,
          role: 'assistant',
          content: accumulatedText,
          thinking: accumulatedReasoning || undefined,
          model: model || DEFAULT_LLM_MODEL,
          tokens: totalTokens,
          parts,
        })
      } catch (error) {
        console.error('[chat/stream] FAILED to persist assistant on uiOnFinish:', error)
        await persistAssistantPartial({ force: true })
      }
    },
    onError: (error) => {
      console.error('[chat/stream] uiOnError:', error)
      after(async () => {
        await persistAssistantPartial({ force: true })
      })
      return 'An error occurred.'
    },
    headers: {
      'X-Conversation-Id': conversation.id,
      'X-Chat-Agent-Id': decision.agentId,
      'X-Chat-Mode': resolvedMode,
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

/**
 * 异步生成对话标题。
 * 失败时返回 null，由调用方决定是否回退默认标题。
 */
async function generateTitle(firstMessage: string): Promise<string | null> {
  try {
    const { generateText } = await import('ai')
    const { text } = await generateText({
      model: getMinimaxModel(),
      system: '你是一个专业的小说创作助手。请根据用户的第一条消息，生成一个简洁、准确的对话标题（不超过20个字）。只需要返回标题，不需要任何其他内容。',
      prompt: firstMessage,
    })
    const title = text.trim()
    if (!title) return null
    return title.length > 20 ? `${title.slice(0, 20)}...` : title
  } catch (err) {
    console.warn('[chat/stream] generateTitle failed:', err)
    return null
  }
}
