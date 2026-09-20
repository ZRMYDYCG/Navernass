import type { NextRequest } from 'next/server'
import { NovelsService } from '@/lib/supabase/sdk/services/novels.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(async (_req: NextRequest) => {
  const supabase = await createClient()
  const novelsService = new NovelsService(supabase)
  const novels = await novelsService.getArchived()
  return ApiResponseBuilder.success(novels)
})
