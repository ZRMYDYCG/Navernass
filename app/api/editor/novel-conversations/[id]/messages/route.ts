import type { NextRequest } from 'next/server'
import { NovelMessagesService } from '@/lib/supabase/sdk/services/novel-messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const messagesService = new NovelMessagesService()

/**
 * GET /api/editor/novel-conversations/[id]/messages
 * 获取会话的所有消息
 */
export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const messages = await messagesService.getByConversationId(params.id)
  return ApiResponseBuilder.success(messages)
})
