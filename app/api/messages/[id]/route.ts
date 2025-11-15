import type { NextRequest } from 'next/server'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const messagesService = new MessagesService()

/**
 * PATCH /api/messages/:id
 * 更新消息
 */
export const PATCH = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const body = await req.json()
    const message = await messagesService.update(id, { content: body.content })
    return ApiResponseBuilder.success(message)
  },
)

/**
 * DELETE /api/messages/:id
 * 删除消息
 */
export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    await messagesService.delete(id)
    return ApiResponseBuilder.success({ message: 'Message deleted successfully' })
  },
)
