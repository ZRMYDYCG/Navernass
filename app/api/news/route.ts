import type { NextRequest } from 'next/server'
import type { CreateNewsDto } from '@/lib/supabase/sdk/types'
import { NewsService } from '@/lib/supabase/sdk/services/news.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const newsService = new NewsService(supabase)
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || undefined
  const status = searchParams.get('status') || undefined
  const page = Number.parseInt(searchParams.get('page') || '1')
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '20')

  const result = await newsService.getList({
    type: type || undefined,
    status: status || undefined,
    page,
    pageSize,
  })

  return ApiResponseBuilder.success(result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  })
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const newsService = new NewsService(supabase)
  const body: CreateNewsDto = await req.json()

  if (!body.type || !body.title || !body.content) {
    return ApiResponseBuilder.error(
      'Type, title and content are required',
      'INVALID_DATA',
      400
    )
  }

  const news = await newsService.create(body)
  return ApiResponseBuilder.success(news)
})
