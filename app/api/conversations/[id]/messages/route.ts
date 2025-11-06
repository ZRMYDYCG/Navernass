import type { NextRequest } from 'next/server'
import type { CreateMessageDto } from '@/lib/supabase/sdk/types'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const messagesService = new MessagesService()

/**
 * GET /api/conversations/:id/messages
 * 获取对话的所有消息
 */
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const messages = await messagesService.getByConversationId(params.id)
    return ApiResponseBuilder.success(messages)
  },
)

/**
 * POST /api/conversations/:id/messages
 * 创建新消息
 */
export const POST = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const body: Omit<CreateMessageDto, 'conversation_id'> = await req.json()
    const messageData: CreateMessageDto = {
      ...body,
      conversation_id: params.id,
    }
    const message = await messagesService.create(messageData)
    return ApiResponseBuilder.success(message)
  },
)
