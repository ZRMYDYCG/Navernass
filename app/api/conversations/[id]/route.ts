import type { NextRequest } from 'next/server'
import type { UpdateConversationDto } from '@/lib/supabase/sdk/types'
import { ConversationsService } from '@/lib/supabase/sdk/services/conversations.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const conversationsService = new ConversationsService()

/**
 * GET /api/conversations/:id
 * 获取对话详情
 */
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const conversation = await conversationsService.getById(id)
    return ApiResponseBuilder.success(conversation)
  },
)

/**
 * PUT /api/conversations/:id
 * 更新对话
 */
export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const body: Partial<UpdateConversationDto> = await req.json()
    const conversation = await conversationsService.update(id, body)
    return ApiResponseBuilder.success(conversation)
  },
)

/**
 * DELETE /api/conversations/:id
 * 删除对话
 */
export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    await conversationsService.delete(id)
    return ApiResponseBuilder.success({ message: 'Conversation deleted successfully' })
  },
)
