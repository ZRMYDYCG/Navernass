import type { NextRequest } from 'next/server'
import { CharacterTimelineEventsService } from '@/lib/supabase/sdk/services/character-timeline-events.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

/** GET /api/editor/novels/[id]/timeline */
export const GET = withErrorHandler(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const supabase = await createClient()
  const service = new CharacterTimelineEventsService(supabase)
  const { id: novelId } = await params
  const list = await service.getByNovelId(novelId)
  return ApiResponseBuilder.success(list)
})
