import type { NextRequest } from 'next/server'
import type { WorldbookCategory } from '@/lib/supabase/sdk'
import { WorldbookEntriesService } from '@/lib/supabase/sdk/services/worldbook-entries.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

/** GET /api/editor/novels/[id]/worldbook?category=... */
export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new WorldbookEntriesService(supabase)
  const { id: novelId } = await params
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') as WorldbookCategory | null
  const list = await service.getByNovelId(novelId, category || undefined)
  return ApiResponseBuilder.success(list)
})

/** POST /api/editor/novels/[id]/worldbook */
export const POST = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new WorldbookEntriesService(supabase)
  const { id: novelId } = await params
  const body = await req.json()
  if (!body.title) return ApiResponseBuilder.badRequest('title is required')
  const created = await service.create({ ...body, novel_id: novelId })
  return ApiResponseBuilder.success(created)
})
