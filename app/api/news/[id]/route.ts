import type { NextRequest } from 'next/server'
import type { UpdateNewsDto } from '@/lib/supabase/sdk/types'
import { NewsService } from '@/lib/supabase/sdk/services/news.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const newsService = new NewsService()

/**
 * GET /api/news/:id
 * 获取新闻详情
 */
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const news = await newsService.getById(params.id)

    // 增加阅读计数
    await newsService.incrementReadCount(params.id)

    return ApiResponseBuilder.success(news)
  },
)

/**
 * PUT /api/news/:id
 * 更新新闻
 */
export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const body: Partial<UpdateNewsDto> = await req.json()
    const news = await newsService.update(params.id, body)
    return ApiResponseBuilder.success(news)
  },
)

/**
 * DELETE /api/news/:id
 * 删除新闻
 */
export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await newsService.delete(params.id)
    return ApiResponseBuilder.success({ message: 'News deleted successfully' })
  },
)
