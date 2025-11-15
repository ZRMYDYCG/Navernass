import type { NextRequest } from 'next/server'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const chaptersService = new ChaptersService()

interface SearchChaptersRequest {
  novelId: string
  keyword: string
  volumeId?: string | null // 检索的卷，null 表示 root
  excludeVolumeId?: string | null // 跳过检索的卷，null 表示 root
}

/**
 * POST /api/chapters/search
 * 搜索章节
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
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
