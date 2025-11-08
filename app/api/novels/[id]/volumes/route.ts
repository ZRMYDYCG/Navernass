import type { NextRequest } from 'next/server'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const volumesService = new VolumesService()

/**
 * GET /api/novels/:id/volumes
 * 获取小说的所有卷
 */
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const volumes = await volumesService.getByNovelId(id)
    return ApiResponseBuilder.success(volumes)
  },
)
