import type { NextRequest } from 'next/server'
import type { CreateConversationDto } from '@/lib/supabase/sdk/types'
import { ConversationsService } from '@/lib/supabase/sdk/services/conversations.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const conversationsService = new ConversationsService()

/**
 * GET /api/conversations
 * 获取对话列表
 */
export const GET = withErrorHandler(async () => {
  const conversations = await conversationsService.getList()
  return ApiResponseBuilder.success(conversations)
})

/**
 * POST /api/conversations
 * 创建新对话
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body: CreateConversationDto = await req.json()
  const conversation = await conversationsService.create(body)
  return ApiResponseBuilder.success(conversation)
})
