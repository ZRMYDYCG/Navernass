import type { NextRequest } from 'next/server'
import type { SendMessageRequest } from '@/lib/supabase/sdk/types'
import { getApiKey } from '@/lib/api-key'
import { ConversationsService } from '@/lib/supabase/sdk/services/conversations.service'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { SiliconFlowService } from '@/lib/supabase/sdk/services/silicon-flow.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const conversationsService = new ConversationsService()
const messagesService = new MessagesService()

/**
 * POST /api/chat/send
 * 发送消息并获取AI回复
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body: SendMessageRequest = await req.json()
  const { conversationId, message } = body

  if (!message || message.trim().length === 0) {
    return ApiResponseBuilder.error('Message cannot be empty', 'INVALID_MESSAGE', 400)
  }

  const userApiKey = await getApiKey('default-user')
  const aiService = new SiliconFlowService(userApiKey || undefined)

  try {
    // 获取或创建对话
    let conversation

    // 验证conversationId是否为有效的UUID
    const isValidUUID = conversationId
      && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)

    if (isValidUUID) {
      // 尝试获取现有对话
      try {
        conversation = await conversationsService.getById(conversationId)
      } catch {
        // 如果对话不存在，创建新对话
        const title = await aiService.generateTitle(message)
        conversation = await conversationsService.create({
          title,
        })
      }
    } else {
      // 创建新对话
      const title = await aiService.generateTitle(message)
      conversation = await conversationsService.create({
        title,
      })
    }

    // 获取对话历史消息（最多20条）
    const historyMessages = await messagesService.getByConversationId(conversation.id)
    const recentHistory = historyMessages.slice(-20)

    // 构建消息列表
    const chatMessages = recentHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))

    // 添加当前用户消息
    chatMessages.push({
      role: 'user' as const,
      content: message,
    })

    // 调用AI服务获取回复
    const aiResponse = await aiService.chat(chatMessages)

    // 保存用户消息
    const userMessage = await messagesService.create({
      conversation_id: conversation.id,
      role: 'user',
      content: message,
      model: aiResponse.model,
      tokens: aiResponse.tokens,
    })

    // 保存AI回复
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
