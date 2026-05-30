import type { NextRequest } from 'next/server'
import { CharacterTimelineEventsService } from '@/lib/supabase/sdk/services/character-timeline-events.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

/** GET /api/editor/characters/[id]/timeline */
export const GET = withErrorHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new CharacterTimelineEventsService(supabase)
  const { id: characterId } = await params
  const list = await service.getByCharacterId(characterId)
  return ApiResponseBuilder.success(list)
})

/** POST /api/editor/characters/[id]/timeline */
export const POST = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new CharacterTimelineEventsService(supabase)
  const { id: characterId } = await params
  const body = await req.json()
  if (!body.title || !body.novel_id) {
    return ApiResponseBuilder.badRequest('title and novel_id are required')
  }
  const created = await service.create({ ...body, character_id: characterId })
  return ApiResponseBuilder.success(created)
})
