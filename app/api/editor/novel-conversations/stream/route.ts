import type { UIMessage } from 'ai'
import type { NextRequest } from 'next/server'
import { after } from 'next/server'
import { consumeStream, convertToModelMessages } from 'ai'
import { bootstrapAgents, runRoutedAgent, route, getAgent } from '@/lib/ai/agents'
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
import {
  extractApiTextFromUserMessage,
  extractCharacterRefsFromMessageParts,
  extractOutlineRefsFromMessageParts,
  extractWorldbookRefsFromMessageParts,
  isRefsOnlyUserMessage,
} from '@/lib/editor/composer-message'
import {
  buildCharacterContextBlock,
  pickPrimaryCharacter,
  resolveCharacterRefsForRequest,
} from '@/lib/editor/character-composer'
import { buildOutlineContextBlock } from '@/lib/editor/outline-composer'
import { buildWorldbookContextBlock } from '@/lib/editor/worldbook-composer'
import { OutlinesService } from '@/lib/supabase/sdk/services/outlines.service'
import { WorldbookEntriesService } from '@/lib/supabase/sdk/services/worldbook-entries.service'
import type { SerializedCharacterRef } from '@/lib/editor/inline-composer'
import { buildChapterContext } from '@/prompts'

interface ChatRequestBody {
  novelId: string
  conversationId?: string
  messages: UIMessage[]
  selectedChapterIds?: string[]
  selectedCharacterIds?: string[]
  focusCharacter?: SerializedCharacterRef
  mode?: string
  model?: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

bootstrapAgents()

function isEmptyModelContent(content: unknown): boolean {
  if (typeof content === 'string') return content.trim().length === 0
  if (Array.isArray(content)) {
    return content.every((part) => {
      if (typeof part !== 'object' || part === null) return true
      const p = part as { type?: string, text?: string }
      return p.type !== 'text' || !p.text?.trim()
    })
  }
  return true
}

function injectContextIntoLastUserMessage(
  modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>,
  contextMessage: string,
  userInput: string,
) {
  const last = modelMessages[modelMessages.length - 1]
  if (last.role !== 'user') return

  const question = userInput.trim() || '（用户通过 @ 引用聚焦，请结合上文继续）'
  const prefix = `${contextMessage}用户问题：`

  if (typeof last.content === 'string') {
    last.content = last.content.trim()
      ? `${prefix}${last.content}`
      : `${prefix}${question}`
    return
  }

  if (Array.isArray(last.content)) {
    if (isEmptyModelContent(last.content)) {
      last.content = [{ type: 'text', text: `${prefix}${question}` }]
      return
    }
    last.content = [
      { type: 'text', text: contextMessage },
      ...last.content,
    ]
  }
}

function pickLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== 'user') continue
    const parts = m.parts || []
    const merged = extractApiTextFromUserMessage(parts)
    if (merged.trim().length > 0) return merged
    const textOnly = parts
      .filter((p: { type?: string }) => p?.type === 'text')
      .map((p: { text?: string }) => p.text as string)
      .join('')
    if (textOnly.trim().length > 0) return textOnly
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
  const worldbookService = new WorldbookEntriesService(supabase)
  const outlinesService = new OutlinesService(supabase)

  const body = (await req.json()) as ChatRequestBody
  const {
    novelId,
    conversationId,
    messages,
    selectedChapterIds,
    selectedCharacterIds,
    focusCharacter: focusCharacterFromBody,
    mode,
    model,
  } = body

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

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
  const characterRefsFromParts = extractCharacterRefsFromMessageParts(
    (lastUserMessage?.parts || []) as unknown[],
  )
  const characterRefs = resolveCharacterRefsForRequest(
    focusCharacterFromBody,
    characterRefsFromParts,
  )
  const focusCharacter = pickPrimaryCharacter(characterRefs)

  // 章节 + @ 角色上下文
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
  const refsOnlyMention = lastUserMessage
    ? isRefsOnlyUserMessage((lastUserMessage.parts || []) as unknown[])
    : false
  const characterBlock = buildCharacterContextBlock(characterRefs, {
    refsOnlyMention,
    userText: userInput,
  })
  if (characterBlock) {
    contextMessage = `${contextMessage}${characterBlock}`
  }

  const worldbookRefs = extractWorldbookRefsFromMessageParts(
    (lastUserMessage?.parts || []) as unknown[],
  )
  if (worldbookRefs.length > 0) {
    try {
      const entries = await Promise.all(
        worldbookRefs.map(async (ref) => {
          try {
            return await worldbookService.getById(ref.id)
          } catch {
            return null
          }
        }),
      )
      const block = buildWorldbookContextBlock(
        entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
      )
      if (block) contextMessage = `${contextMessage}${block}`
    } catch (error) {
      console.warn('Failed to load @ worldbook entries:', error)
    }
  }

  const outlineRefs = extractOutlineRefsFromMessageParts(
    (lastUserMessage?.parts || []) as unknown[],
  )
  if (outlineRefs.length > 0) {
    try {
      const outlines = await Promise.all(
        outlineRefs.map(async (ref) => {
          try {
            return await outlinesService.getById(ref.id)
          } catch {
            return null
          }
        }),
      )
      const block = buildOutlineContextBlock(
        outlines.filter((outline): outline is NonNullable<typeof outline> => Boolean(outline)),
      )
      if (block) contextMessage = `${contextMessage}${block}`
    } catch (error) {
      console.warn('Failed to load @ outline nodes:', error)
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
    injectContextIntoLastUserMessage(modelMessages, contextMessage, userInput)
  } else if (modelMessages.length > 0) {
    const last = modelMessages[modelMessages.length - 1]
    if (last.role === 'user' && isEmptyModelContent(last.content)) {
      const fallback = userInput.trim() || '请结合上文继续。'
      if (typeof last.content === 'string') {
        last.content = fallback
      } else if (Array.isArray(last.content)) {
        last.content = [{ type: 'text', text: fallback }]
      }
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

  // 按 router 派发到对应 specialist / writer（含 subagent 工具）
  const result = runRoutedAgent({
    uiMessages: messages,
    modelMessages,
    modelId: model,
    mode: mode || 'ask',
    userText: userInput,
    decision,
    toolContext: {
      supabase,
      userId: user.id,
      novelId,
      conversationId: conversation.id,
      selectedChapterIds,
      focusCharacterId: focusCharacter?.id,
      focusCharacterName: focusCharacter?.name,
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
