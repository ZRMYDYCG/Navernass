import type { NextRequest } from 'next/server'
import { NovelsService } from '@/lib/supabase/sdk/services/novels.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const novelsService = new NovelsService()

/**
 * POST /api/novels/:id/archive
 * 归档小说
 */
export const POST = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const novel = await novelsService.archive(id)
    return ApiResponseBuilder.success(novel)
  },
)
