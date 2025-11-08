import type { NextRequest } from 'next/server'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const volumesService = new VolumesService()

/**
 * GET /api/volumes/:id/chapters
 * 获取卷下的所有章节
 */
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const chapters = await volumesService.getChapters(id)
    return ApiResponseBuilder.success(chapters)
  },
)
