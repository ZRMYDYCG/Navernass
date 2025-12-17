import type { NextRequest } from 'next/server'
import type { CreateNovelDto } from '@/lib/supabase/sdk/types'
import { NovelsService } from '@/lib/supabase/sdk/services/novels.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const novelsService = new NovelsService(supabase)
  const { searchParams } = new URL(req.url)

  const params = {
    page: Number(searchParams.get('page')) || 1,
    pageSize: Number(searchParams.get('pageSize')) || 10,
    status: searchParams.get('status') || undefined,
  }

  const result = await novelsService.getList(params)

  return ApiResponseBuilder.success(result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  })
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const novelsService = new NovelsService(supabase)
  const body: CreateNovelDto = await req.json()
  const novel = await novelsService.create(body)
  return ApiResponseBuilder.success(novel)
})
