import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { NovelMessagesService } from '@/lib/supabase/sdk/services/novel-messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

/**
 * GET /api/editor/novel-conversations/[id]/messages
 * 获取会话的所有消息
 */
export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const messagesService = new NovelMessagesService(supabase)

  const { id } = await params
  const messages = await messagesService.getByConversationId(id)
  return ApiResponseBuilder.success(messages)
})
