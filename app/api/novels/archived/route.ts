import type { NextRequest } from 'next/server'
import { NovelsService } from '@/lib/supabase/sdk/services/novels.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const novelsService = new NovelsService()

/**
 * GET /api/novels/archived
 * 获取归档的小说列表
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const novels = await novelsService.getArchived()
  return ApiResponseBuilder.success(novels)
})
