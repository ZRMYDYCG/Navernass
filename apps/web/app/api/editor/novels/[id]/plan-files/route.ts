import type { NextRequest } from 'next/server'
import { PlanFilesService } from '@/lib/supabase/sdk/services/plan-files.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

/** GET /api/editor/novels/[id]/plan-files */
export const GET = withErrorHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new PlanFilesService(supabase)
  const { id: novelId } = await params
  const list = await service.getByNovelId(novelId)
  return ApiResponseBuilder.success(list)
})

/** POST /api/editor/novels/[id]/plan-files */
export const POST = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new PlanFilesService(supabase)
  const { id: novelId } = await params
  const body = await req.json()
  if (!body.path) return ApiResponseBuilder.badRequest('path is required')
  const created = await service.create({ ...body, novel_id: novelId })
  return ApiResponseBuilder.success(created)
})
