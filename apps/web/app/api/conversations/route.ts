import type { NextRequest } from 'next/server'
import type { CreateConversationDto } from '@/lib/supabase/sdk/types'
import { ConversationsService } from '@/lib/supabase/sdk/services/conversations.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(async () => {
  const supabase = await createClient()
  const conversationsService = new ConversationsService(supabase)
  const conversations = await conversationsService.getList()
  return ApiResponseBuilder.success(conversations)
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const conversationsService = new ConversationsService(supabase)
  const body: CreateConversationDto = await req.json()
  const conversation = await conversationsService.create(body)
  return ApiResponseBuilder.success(conversation)
})
