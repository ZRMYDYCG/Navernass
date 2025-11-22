import type { NextRequest } from 'next/server'
import type { SendMessageRequest } from '@/lib/supabase/sdk/types'
import { getApiKey } from '@/lib/api-key'
import { ConversationsService } from '@/lib/supabase/sdk/services/conversations.service'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { SiliconFlowService } from '@/lib/supabase/sdk/services/silicon-flow.service'

const conversationsService = new ConversationsService()
const messagesService = new MessagesService()

/**
 * POST /api/chat/stream
 * 流式发送消息并获取AI回复
 */
export async function POST(req: NextRequest) {
  const body: SendMessageRequest = await req.json()
  const { conversationId, message } = body

  if (!message || message.trim().length === 0) {
    return new Response('Message cannot be empty', { status: 400 })
  }

  const userApiKey = await getApiKey('default-user')
  const aiService = new SiliconFlowService(userApiKey || undefined)

  // 创建流式响应
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
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

        // 发送对话ID
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'conversation_id', data: conversation.id })}\n\n`),
        )

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

        // 先保存用户消息（使用临时tokens和model）
        const userMessage = await messagesService.create({
          conversation_id: conversation.id,
          role: 'user',
          content: message,
          model: 'deepseek-chat',
          tokens: 0,
        })

        // 发送用户消息ID
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'user_message_id', data: userMessage.id })}\n\n`),
        )

        // 流式调用AI服务
        let fullContent = ''
        let tokens = 0
        let model = 'deepseek-chat'

        await aiService.chatStream(chatMessages, (chunk) => {
          fullContent += chunk.content
          tokens = chunk.tokens || tokens
          model = chunk.model || model

          // 发送流式内容（检查 controller 是否仍然打开）
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'content', data: chunk.content })}\n\n`),
            )
          } catch {
            // Controller 已关闭，客户端可能已断开连接
            console.warn('Controller closed during streaming')
          }
        })

        // 保存AI回复
        const assistantMessage = await messagesService.create({
          conversation_id: conversation.id,
          role: 'assistant',
          content: fullContent,
          model,
          tokens,
        })

        // 发送完成信号（检查 controller 是否仍然打开）
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'done',
              data: {
                messageId: assistantMessage.id,
                tokens,
                model,
              },
            })}\n\n`),
          )
          controller.close()
        } catch {
          // Controller 已关闭，客户端可能已断开连接
          console.warn('Controller closed when sending done signal')
        }
      } catch (error: any) {
        console.error('Stream error:', error)
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', data: error.message })}\n\n`),
          )
          controller.close()
        } catch {
          // Controller 已关闭
          console.warn('Controller already closed in error handler')
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
