import type { NextRequest } from 'next/server'
import type { UpdateNovelDto } from '@/lib/supabase/sdk/types'
import { NovelsService } from '@/lib/supabase/sdk/services/novels.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const novelsService = new NovelsService(supabase)
    const { id } = await params
    const novel = await novelsService.getById(id)
    return ApiResponseBuilder.success(novel)
  },
)

export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const novelsService = new NovelsService(supabase)
    const { id } = await params
    const body: Partial<UpdateNovelDto> = await req.json()
    const novel = await novelsService.update(id, body)
    return ApiResponseBuilder.success(novel)
  },
)

export const DELETE = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const novelsService = new NovelsService(supabase)
    const { id } = await params
    await novelsService.delete(id)
    return ApiResponseBuilder.success({ message: 'Novel deleted successfully' })
  },
)
