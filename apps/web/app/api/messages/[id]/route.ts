import type { NextRequest } from 'next/server'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const PATCH = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const messagesService = new MessagesService(supabase)
    const { id } = await params
    const body = await req.json()
    const message = await messagesService.update(id, { content: body.content })
    return ApiResponseBuilder.success(message)
  },
)

export const DELETE = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const messagesService = new MessagesService(supabase)
    const { id } = await params
    await messagesService.delete(id)
    return ApiResponseBuilder.success({ message: 'Message deleted successfully' })
  },
)
