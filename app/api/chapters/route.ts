import type { NextRequest } from 'next/server'
import type { CreateChapterDto } from '@/lib/supabase/sdk/types'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const chaptersService = new ChaptersService()

/**
 * POST /api/chapters
 * 创建新章节
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body: CreateChapterDto = await req.json()
  const chapter = await chaptersService.create(body)
  return ApiResponseBuilder.success(chapter)
})
