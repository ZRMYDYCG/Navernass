import type { NextRequest } from 'next/server'
import type { UpdateVolumeDto } from '@/lib/supabase/sdk/types'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const volumesService = new VolumesService()

/**
 * GET /api/volumes/:id
 * 获取卷详情
 */
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const volume = await volumesService.getById(id)
    return ApiResponseBuilder.success(volume)
  },
)

/**
 * PUT /api/volumes/:id
 * 更新卷
 */
export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const body: Partial<UpdateVolumeDto> = await req.json()
    const volume = await volumesService.update(id, body)
    return ApiResponseBuilder.success(volume)
  },
)

/**
 * DELETE /api/volumes/:id
 * 删除卷
 */
export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    await volumesService.delete(id)
    return ApiResponseBuilder.success({ message: 'Volume deleted successfully' })
  },
)
