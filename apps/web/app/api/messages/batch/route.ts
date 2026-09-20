import type { NextRequest } from 'next/server'
import type { CreateMessageDto } from '@/lib/supabase/sdk/types'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const messagesService = new MessagesService(supabase)
  const body: CreateMessageDto[] = await req.json()
  const messages = await messagesService.createBatch(body)
  return ApiResponseBuilder.success(messages)
})
