import type { NextRequest } from 'next/server'
import type { CreateMessageDto } from '@/lib/supabase/sdk/types'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const messagesService = new MessagesService()

/**
 * POST /api/messages/batch
 * 批量创建消息
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body: CreateMessageDto[] = await req.json()
  const messages = await messagesService.createBatch(body)
  return ApiResponseBuilder.success(messages)
})
