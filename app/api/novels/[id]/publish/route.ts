import type { NextRequest } from 'next/server'
import { NovelsService } from '@/lib/supabase/sdk/services/novels.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const novelsService = new NovelsService()

/**
 * POST /api/novels/:id/publish
 * 发布小说
 */
export const POST = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const novel = await novelsService.publish(params.id)
    return ApiResponseBuilder.success(novel)
  },
)

/**
 * DELETE /api/novels/:id/publish
 * 取消发布小说
 */
export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const novel = await novelsService.unpublish(params.id)
    return ApiResponseBuilder.success(novel)
  },
)
