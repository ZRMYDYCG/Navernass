import type { NextRequest } from 'next/server'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/chat/conversations/[id]/messages
 * 获取对话的所有消息（useChat 重构后供前端加载历史用）
 */
export const GET = withErrorHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const messagesService = new MessagesService(supabase)
  const { id } = await params
  const messages = await messagesService.getByConversationId(id)
  return ApiResponseBuilder.success(messages)
})
