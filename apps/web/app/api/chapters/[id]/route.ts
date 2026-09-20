import type { NextRequest } from 'next/server'
import type { UpdateChapterDto } from '@/lib/supabase/sdk/types'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const chaptersService = new ChaptersService(supabase)
    const { id } = await params
    const chapter = await chaptersService.getById(id)
    return ApiResponseBuilder.success(chapter)
  },
)

export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const chaptersService = new ChaptersService(supabase)
    const { id } = await params
    const body: Partial<UpdateChapterDto> = await req.json()
    const chapter = await chaptersService.update(id, body)
    return ApiResponseBuilder.success(chapter)
  },
)

export const DELETE = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const chaptersService = new ChaptersService(supabase)
    const { id } = await params
    await chaptersService.delete(id)
    return ApiResponseBuilder.success({ message: 'Chapter deleted successfully' })
  },
)
