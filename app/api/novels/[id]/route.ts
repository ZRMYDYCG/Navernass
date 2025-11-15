import type { NextRequest } from 'next/server'
import type { UpdateNovelDto } from '@/lib/supabase/sdk/types'
import { NovelsService } from '@/lib/supabase/sdk/services/novels.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const novelsService = new NovelsService()

/**
 * GET /api/novels/:id
 * 获取小说详情
 */
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const novel = await novelsService.getById(id)
    return ApiResponseBuilder.success(novel)
  },
)

/**
 * PUT /api/novels/:id
 * 更新小说
 */
export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const body: Partial<UpdateNovelDto> = await req.json()
    const novel = await novelsService.update(id, body)
    return ApiResponseBuilder.success(novel)
  },
)

/**
 * DELETE /api/novels/:id
 * 删除小说
 */
export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    await novelsService.delete(id)
    return ApiResponseBuilder.success({ message: 'Novel deleted successfully' })
  },
)
