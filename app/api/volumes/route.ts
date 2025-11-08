import type { NextRequest } from 'next/server'
import type { CreateVolumeDto } from '@/lib/supabase/sdk/types'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const volumesService = new VolumesService()

/**
 * POST /api/volumes
 * 创建新卷
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body: CreateVolumeDto = await req.json()
  const volume = await volumesService.create(body)
  return ApiResponseBuilder.success(volume)
})
