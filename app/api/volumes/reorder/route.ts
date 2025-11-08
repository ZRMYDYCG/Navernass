import type { NextRequest } from 'next/server'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const volumesService = new VolumesService()

/**
 * POST /api/volumes/reorder
 * 批量更新卷顺序
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body: Array<{ id: string, order_index: number }> = await req.json()
  await volumesService.updateOrder(body)
  return ApiResponseBuilder.success({ message: 'Volumes reordered successfully' })
})
