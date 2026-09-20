import type { NextRequest } from 'next/server'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const volumesService = new VolumesService(supabase)
  const body: Array<{ id: string, order_index: number }> = await req.json()
  await volumesService.updateOrder(body)
  return ApiResponseBuilder.success({ message: 'Volumes reordered successfully' })
})
