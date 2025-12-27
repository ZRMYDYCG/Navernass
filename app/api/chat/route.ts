import type { NextRequest } from 'next/server'
import { getApiKey } from '@/lib/api-key'
import { SiliconFlowService } from '@/lib/supabase/sdk/services/silicon-flow.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'
import { getChatPrompt } from '@/prompts'

interface CreateConversationRequest {
  message?: string
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const body: CreateConversationRequest = await req.json()

  const userApiKey = await getApiKey('default-user')
  const aiService = new SiliconFlowService(userApiKey || undefined)

  let title = '新对话'
  if (body.message) {
    try {
      title = await aiService.generateTitle(body.message)
    } catch {
      title = '新对话'
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user?.id,
      title,
    })
    .select()
    .single()

  if (error) throw error

  return ApiResponseBuilder.success({ conversation })
})
