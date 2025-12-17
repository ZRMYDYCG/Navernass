import type { NextRequest } from 'next/server'
import type { SendMessageRequest } from '@/lib/supabase/sdk/types'
import { getApiKey } from '@/lib/api-key'
import { ConversationsService } from '@/lib/supabase/sdk/services/conversations.service'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { SiliconFlowService } from '@/lib/supabase/sdk/services/silicon-flow.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { getChatPrompt } from '@/prompts'
import { createClient } from '@/lib/supabase/server'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const conversationsService = new ConversationsService(supabase)
  const messagesService = new MessagesService(supabase)
  const body: SendMessageRequest = await req.json()
  const { conversationId, message } = body

  if (!message || message.trim().length === 0) {
    return ApiResponseBuilder.error('Message cannot be empty', 'INVALID_MESSAGE', 400)
  }

  const userApiKey = await getApiKey('default-user')
  const aiService = new SiliconFlowService(userApiKey || undefined)

  try {
    let conversation

    const isValidUUID = conversationId
      && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)

    if (isValidUUID) {
      try {
        conversation = await conversationsService.getById(conversationId)
      } catch {
        const title = await aiService.generateTitle(message)
        conversation = await conversationsService.create({
          title,
        })
      }
    } else {
      const title = await aiService.generateTitle(message)
      conversation = await conversationsService.create({
        title,
      })
    }

    const historyMessages = await messagesService.getByConversationId(conversation.id)
    const recentHistory = historyMessages.slice(-20)

    const chatMessages = recentHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))

    chatMessages.push({
      role: 'user' as const,
      content: message,
    })

    const aiResponse = await aiService.chat(chatMessages, getChatPrompt('default'))

    const userMessage = await messagesService.create({
      conversation_id: conversation.id,
      role: 'user',
      content: message,
      model: aiResponse.model,
      tokens: aiResponse.tokens,
    })

    const assistantMessage = await messagesService.create({
      conversation_id: conversation.id,
      role: 'assistant',
      content: aiResponse.content,
      model: aiResponse.model,
      tokens: aiResponse.tokens,
    })

    return ApiResponseBuilder.success({
      conversationId: conversation.id,
      userMessage,
      assistantMessage,
    })
  } catch (error: any) {
    console.error('Chat send error:', error)
    return ApiResponseBuilder.error(
      error.message || 'Failed to send message',
      'CHAT_ERROR',
      500,
    )
  }
})
