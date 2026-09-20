import type { NextRequest } from 'next/server'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const POST = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const chaptersService = new ChaptersService(supabase)
    const { id } = await params
    const chapter = await chaptersService.publish(id)
    return ApiResponseBuilder.success(chapter)
  },
)

export const DELETE = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const chaptersService = new ChaptersService(supabase)
    const { id } = await params
    const chapter = await chaptersService.unpublish(id)
    return ApiResponseBuilder.success(chapter)
  },
)
