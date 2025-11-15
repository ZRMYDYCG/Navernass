import type { NextRequest } from 'next/server'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const chaptersService = new ChaptersService()

/**
 * GET /api/novels/:id/chapters
 * 获取小说的所有章节
 */
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const chapters = await chaptersService.getByNovelId(id)
    return ApiResponseBuilder.success(chapters)
  },
)
