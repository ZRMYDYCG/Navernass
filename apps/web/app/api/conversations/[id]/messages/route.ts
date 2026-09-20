import type { NextRequest } from 'next/server'
import type { CreateMessageDto } from '@/lib/supabase/sdk/types'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const messagesService = new MessagesService(supabase)
    const { id } = await params
    const messages = await messagesService.getByConversationId(id)
    return ApiResponseBuilder.success(messages)
  },
)

export const POST = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const messagesService = new MessagesService(supabase)
    const { id } = await params
    const body: Omit<CreateMessageDto, 'conversation_id'> = await req.json()
    const messageData: CreateMessageDto = {
      ...body,
      conversation_id: id,
    }
    const message = await messagesService.create(messageData)
    return ApiResponseBuilder.success(message)
  },
)
