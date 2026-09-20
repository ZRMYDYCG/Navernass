import type { NextRequest } from 'next/server'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const chaptersService = new ChaptersService(supabase)
  const body: Array<{ id: string, order_index: number }> = await req.json()
  await chaptersService.updateOrder(body)
  return ApiResponseBuilder.success({ message: 'Chapter order updated successfully' })
})
