import type { NextRequest } from 'next/server'
import { NovelsService } from '@/lib/supabase/sdk/services/novels.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const novelsService = new NovelsService()

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body: Array<{ id: string, order_index: number }> = await req.json()
  await novelsService.updateOrder(body)
  return ApiResponseBuilder.success({ message: 'Novel order updated successfully' })
})
