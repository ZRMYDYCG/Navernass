import type { NextRequest } from 'next/server'
import { OutlinesService } from '@/lib/supabase/sdk/services/outlines.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

/** GET /api/editor/novels/[id]/outlines?volumeId=...&parentId=... */
export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new OutlinesService(supabase)
  const { id: novelId } = await params
  const { searchParams } = new URL(req.url)

  const parseFilter = (key: string): string | null | undefined => {
    if (!searchParams.has(key)) return undefined
    const v = searchParams.get(key)
    return v === '__null__' ? null : v
  }

  const list = await service.getByNovelId(novelId, {
    volumeId: parseFilter('volumeId'),
    parentId: parseFilter('parentId'),
  })
  return ApiResponseBuilder.success(list)
})

/** POST /api/editor/novels/[id]/outlines */
export const POST = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new OutlinesService(supabase)
  const { id: novelId } = await params
  const body = await req.json()
  if (!body.title) return ApiResponseBuilder.badRequest('title is required')
  const created = await service.create({ ...body, novel_id: novelId })
  return ApiResponseBuilder.success(created)
})
