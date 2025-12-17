import type { NextRequest } from 'next/server'
import type { UpdateNewsDto } from '@/lib/supabase/sdk/types'
import { NewsService } from '@/lib/supabase/sdk/services/news.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const newsService = new NewsService(supabase)
    const { id } = await params
    const news = await newsService.getById(id)

    await newsService.incrementReadCount(id)

    return ApiResponseBuilder.success(news)
  },
)

export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const newsService = new NewsService(supabase)
    const { id } = await params
    const body: Partial<UpdateNewsDto> = await req.json()
    const news = await newsService.update(id, body)
    return ApiResponseBuilder.success(news)
  },
)

export const DELETE = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const newsService = new NewsService(supabase)
    const { id } = await params
    await newsService.delete(id)
    return ApiResponseBuilder.success({ message: 'News deleted successfully' })
  },
)
