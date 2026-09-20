import type { NextRequest } from 'next/server'
import type { CreateVolumeDto } from '@/lib/supabase/sdk/types'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const volumesService = new VolumesService(supabase)
  const body: CreateVolumeDto = await req.json()
  const volume = await volumesService.create(body)
  return ApiResponseBuilder.success(volume)
})
