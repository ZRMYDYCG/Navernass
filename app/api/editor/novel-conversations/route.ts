import type { NextRequest } from 'next/server'
import { NovelConversationsService } from '@/lib/supabase/sdk/services/novel-conversations.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const conversationsService = new NovelConversationsService()

/**
 * GET /api/editor/novel-conversations
 * 获取小说的所有会话
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get('novelId')

  if (!novelId) {
    return ApiResponseBuilder.badRequest('novelId is required')
  }

  const conversations = await conversationsService.getByNovelId(novelId)
  return ApiResponseBuilder.success(conversations)
})

/**
 * POST /api/editor/novel-conversations
 * 创建新会话
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { novelId, title } = body

  if (!novelId || !title) {
    return ApiResponseBuilder.badRequest('novelId and title are required')
  }

  const conversation = await conversationsService.create({
    novel_id: novelId,
    title,
  })

  return ApiResponseBuilder.success(conversation)
})
