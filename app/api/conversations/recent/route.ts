import type { NextRequest } from 'next/server'
import { ConversationsService } from '@/lib/supabase/sdk/services/conversations.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const conversationsService = new ConversationsService(supabase)
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit')) || 10

  const conversations = await conversationsService.getRecent(limit)
  return ApiResponseBuilder.success(conversations)
})
