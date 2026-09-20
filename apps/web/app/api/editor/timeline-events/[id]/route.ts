import type { NextRequest } from 'next/server'
import { CharacterTimelineEventsService } from '@/lib/supabase/sdk/services/character-timeline-events.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new CharacterTimelineEventsService(supabase)
  const { id } = await params
  try {
    const event = await service.getById(id)
    return ApiResponseBuilder.success(event)
  } catch (err) {
    const e = err as { statusCode?: number }
    if (e.statusCode === 404) return ApiResponseBuilder.notFound('Timeline event')
    throw err
  }
})

export const PATCH = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new CharacterTimelineEventsService(supabase)
  const { id } = await params
  const body = await req.json()
  try {
    const updated = await service.update(id, body)
    return ApiResponseBuilder.success(updated)
  } catch (err) {
    const e = err as { statusCode?: number }
    if (e.statusCode === 404) return ApiResponseBuilder.notFound('Timeline event')
    throw err
  }
})

export const DELETE = withErrorHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new CharacterTimelineEventsService(supabase)
  const { id } = await params
  try {
    await service.delete(id)
    return ApiResponseBuilder.success({ success: true })
  } catch (err) {
    const e = err as { statusCode?: number }
    if (e.statusCode === 404) return ApiResponseBuilder.notFound('Timeline event')
    throw err
  }
})
