import type { UIMessage } from 'ai'
import type { NextRequest } from 'next/server'
import { convertToModelMessages, streamText } from 'ai'
import { DEFAULT_LLM_MODEL, getMinimaxModel } from '@/lib/ai/minimax'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'
import { NovelConversationsService } from '@/lib/supabase/sdk/services/novel-conversations.service'
import { NovelMessagesService } from '@/lib/supabase/sdk/services/novel-messages.service'
import { createClient } from '@/lib/supabase/server'
import { buildChapterContext, getNovelPrompt } from '@/prompts'

interface ChatRequestBody {
  novelId: string
  conversationId?: string
  messages: UIMessage[]
  selectedChapterIds?: string[]
  mode?: string
  model?: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

  const systemPrompt = getNovelPrompt(
    mode === 'agent' || mode === 'plan' || mode === 'default' ? mode : 'default',
  )

  // 先持久化用户消息（保存原始内容，不含上下文）
  await messagesService.create({
    conversation_id: conversation.id,
    novel_id: novelId,
    role: 'user',
    content: userInput,
    model: model || DEFAULT_LLM_MODEL,
    tokens: 0,
  })

  // 构建发送给模型的消息：注入 system + 章节上下文（仅在最后一条用户消息上拼接）
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

  const result = streamText({
    model: getMinimaxModel(model),
    system: systemPrompt,
    messages: modelMessages,
    temperature: 0.7,
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
    onError: (e) => {
      console.error('streamText error:', e)
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    headers: {
      'X-Conversation-Id': conversation.id,
    },
  })
}
