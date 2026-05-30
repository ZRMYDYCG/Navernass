import type { NextRequest } from 'next/server'
import { WorldbookEntriesService } from '@/lib/supabase/sdk/services/worldbook-entries.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

/** GET /api/editor/worldbook/[id] */
export const GET = withErrorHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new WorldbookEntriesService(supabase)
  const { id } = await params
  try {
    const entry = await service.getById(id)
    return ApiResponseBuilder.success(entry)
  } catch (err) {
    const e = err as { statusCode?: number }
    if (e.statusCode === 404) return ApiResponseBuilder.notFound('Worldbook entry')
    throw err
  }
})

/** PATCH /api/editor/worldbook/[id] */
export const PATCH = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new WorldbookEntriesService(supabase)
  const { id } = await params
  const body = await req.json()
  try {
    const updated = await service.update(id, body)
    return ApiResponseBuilder.success(updated)
  } catch (err) {
    const e = err as { statusCode?: number }
    if (e.statusCode === 404) return ApiResponseBuilder.notFound('Worldbook entry')
    throw err
  }
})

/** DELETE /api/editor/worldbook/[id] */
export const DELETE = withErrorHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new WorldbookEntriesService(supabase)
  const { id } = await params
  try {
    await service.delete(id)
    return ApiResponseBuilder.success({ success: true })
  } catch (err) {
    const e = err as { statusCode?: number }
    if (e.statusCode === 404) return ApiResponseBuilder.notFound('Worldbook entry')
    throw err
  }
})
