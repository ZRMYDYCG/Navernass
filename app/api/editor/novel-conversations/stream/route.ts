import type { NextRequest } from 'next/server'
import type { SendNovelMessageRequest } from '@/lib/supabase/sdk/types'
import { getApiKey } from '@/lib/api-key'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'
import { NovelConversationsService } from '@/lib/supabase/sdk/services/novel-conversations.service'
import { NovelMessagesService } from '@/lib/supabase/sdk/services/novel-messages.service'
import { SiliconFlowService } from '@/lib/supabase/sdk/services/silicon-flow.service'

const conversationsService = new NovelConversationsService()
const messagesService = new NovelMessagesService()
const chaptersService = new ChaptersService()

/**
 * POST /api/editor/novel-conversations/stream
 * 流式发送消息并获取AI回复（小说编辑器）
 */
export async function POST(req: NextRequest) {
  const body: SendNovelMessageRequest = await req.json()
  const { novelId, conversationId, message, selectedChapterIds, mode, model } = body

  if (!novelId || !message || message.trim().length === 0) {
    return new Response('novelId and message are required', { status: 400 })
  }

  const userApiKey = await getApiKey('default-user')
  const aiService = new SiliconFlowService(userApiKey || undefined)

  // 创建流式响应
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let conversation

        const isValidUUID = conversationId
          && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)

        if (isValidUUID) {
          try {
            conversation = await conversationsService.getById(conversationId)
            if (conversation.novel_id !== novelId) {
              throw new Error('Conversation does not belong to this novel')
            }
          } catch {
            const title = await aiService.generateTitle(message)
            conversation = await conversationsService.create({
              novel_id: novelId,
              title,
            })
          }
        } else {
          const title = await aiService.generateTitle(message)
          conversation = await conversationsService.create({
            novel_id: novelId,
            title,
          })
        }

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

        // 如果有选中的章节，添加章节内容到上下文
        let contextMessage = ''
        if (selectedChapterIds && selectedChapterIds.length > 0) {
          try {
            const chapters = await Promise.all(
              selectedChapterIds.map(id => chaptersService.getById(id)),
            )
            const chaptersContent = chapters
              .map(ch => `## ${ch.title}\n\n${ch.content}`)
              .join('\n\n---\n\n')
            contextMessage = `以下是用户选中的章节内容，请参考这些内容来回答用户的问题：\n\n${chaptersContent}\n\n---\n\n`
          } catch (error) {
            console.warn('Failed to load selected chapters:', error)
          }
        }

        // 根据模式构建系统提示词
        let systemPrompt = '你是一个专业的小说创作助手，擅长帮助用户构思情节、塑造角色、续写故事。请用温暖、鼓励的语气与用户交流，提供有创意的建议。请只返回纯文本内容，不要使用 markdown 格式。'
        if (mode === 'agent') {
          systemPrompt = '你是一个智能的小说创作助手，可以主动分析用户的小说内容，提供创作建议、情节规划、角色塑造等多方面的帮助。请只返回纯文本内容，不要使用 markdown 格式。'
        } else if (mode === 'plan') {
          systemPrompt = '你是一个专业的小说规划助手，擅长帮助用户制定创作计划、梳理故事结构、规划章节内容。请只返回纯文本内容，不要使用 markdown 格式。'
        }

        // 添加当前用户消息（包含上下文）
        const userMessageContent = contextMessage ? `${contextMessage}用户问题：${message}` : message
        chatMessages.push({
          role: 'user' as const,
          content: userMessageContent,
        })

        // 先保存用户消息（使用临时tokens和model）
        const userMessage = await messagesService.create({
          conversation_id: conversation.id,
          novel_id: novelId,
          role: 'user',
          content: message, // 保存原始消息，不包含上下文
          model: model || 'deepseek-chat',
          tokens: 0,
        })

        // 发送用户消息ID
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'user_message_id', data: userMessage.id })}\n\n`),
        )

        // 流式调用AI服务
        let fullContent = ''
        let tokens = 0
        let finalModel = model || 'deepseek-chat'

        // 构建完整的消息列表（包含系统提示）
        const fullMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...chatMessages,
        ]

        await aiService.chatStream(fullMessages, (chunk) => {
          fullContent += chunk.content
          tokens = chunk.tokens || tokens
          finalModel = chunk.model || finalModel

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
          novel_id: novelId,
          role: 'assistant',
          content: fullContent,
          model: finalModel,
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
                model: finalModel,
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
