import type { NextRequest } from 'next/server'
import type { UpdateConversationDto } from '@/lib/supabase/sdk/types'
import { ConversationsService } from '@/lib/supabase/sdk/services/conversations.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const conversationsService = new ConversationsService(supabase)
    const { id } = await params
    const conversation = await conversationsService.getById(id)
    return ApiResponseBuilder.success(conversation)
  },
)

export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const conversationsService = new ConversationsService(supabase)
    const { id } = await params
    const body: Partial<UpdateConversationDto> = await req.json()
    const conversation = await conversationsService.update(id, body)
    return ApiResponseBuilder.success(conversation)
  },
)

export const DELETE = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const conversationsService = new ConversationsService(supabase)
    const { id } = await params
    await conversationsService.delete(id)
    return ApiResponseBuilder.success({ message: 'Conversation deleted successfully' })
  },
)
