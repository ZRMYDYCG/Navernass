import type { NextRequest } from 'next/server'
import { NovelConversationsService } from '@/lib/supabase/sdk/services/novel-conversations.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const conversationsService = new NovelConversationsService()

/**
 * GET /api/editor/novel-conversations/[id]
 * 获取会话详情
 */
export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const conversation = await conversationsService.getById(params.id)
    return ApiResponseBuilder.success(conversation)
  } catch (error: any) {
    if (error.statusCode === 404) {
      return ApiResponseBuilder.notFound('Conversation')
    }
    throw error
  }
})

/**
 * PATCH /api/editor/novel-conversations/[id]
 * 更新会话
 */
export const PATCH = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const body = await req.json()
  try {
    const conversation = await conversationsService.update(params.id, body)
    return ApiResponseBuilder.success(conversation)
  } catch (error: any) {
    if (error.statusCode === 404) {
      return ApiResponseBuilder.notFound('Conversation')
    }
    throw error
  }
})

/**
 * DELETE /api/editor/novel-conversations/[id]
 * 删除会话
 */
export const DELETE = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    await conversationsService.delete(params.id)
    return ApiResponseBuilder.success({ success: true })
  } catch (error: any) {
    if (error.statusCode === 404) {
      return ApiResponseBuilder.notFound('Conversation')
    }
    throw error
  }
})
