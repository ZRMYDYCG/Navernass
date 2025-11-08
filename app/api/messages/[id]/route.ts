import type { NextRequest } from 'next/server'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const messagesService = new MessagesService()

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
