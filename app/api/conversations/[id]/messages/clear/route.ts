import type { NextRequest } from 'next/server'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const messagesService = new MessagesService()

/**
 * DELETE /api/conversations/:id/messages/clear
 * 清空对话的所有消息
 */
export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    await messagesService.clearByConversationId(id)
    return ApiResponseBuilder.success({ message: 'Messages cleared successfully' })
  },
)
