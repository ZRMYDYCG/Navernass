import type { NextRequest } from 'next/server'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

interface SearchChaptersRequest {
  novelId: string
  keyword: string
  volumeId?: string | null
  excludeVolumeId?: string | null
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const chaptersService = new ChaptersService(supabase)
  const body: SearchChaptersRequest = await req.json()
  const { novelId, keyword, volumeId, excludeVolumeId } = body

  if (!novelId || !keyword) {
    return ApiResponseBuilder.badRequest('Missing required fields: novelId and keyword')
  }

  const results = await chaptersService.search({
    novelId,
    keyword,
    volumeId: volumeId === undefined ? undefined : (volumeId || null),
    excludeVolumeId: excludeVolumeId === undefined ? undefined : (excludeVolumeId || null),
  })

  return ApiResponseBuilder.success(results)
})
