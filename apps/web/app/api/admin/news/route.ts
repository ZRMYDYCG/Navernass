import type { NextRequest } from 'next/server'
import type { CreateNewsDto, UpdateNewsDto } from '@/lib/supabase/sdk/types'
import { requireSuperAdmin } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { AdminService } from '@/lib/supabase/sdk/services/admin.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export const GET = withErrorHandler(async (req: NextRequest) => {
  await requireSuperAdmin()
  const { searchParams } = new URL(req.url)
  const page = Number.parseInt(searchParams.get('page') || '1', 10)
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '20', 10)
  const status = searchParams.get('status') || undefined

  const adminService = new AdminService(createServiceRoleClient())
  const result = await adminService.listNews(page, pageSize, status || undefined)

  return ApiResponseBuilder.success(result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  })
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  await requireSuperAdmin()
  const body: CreateNewsDto = await req.json()

  if (!body.type || !body.title || !body.content) {
    return ApiResponseBuilder.badRequest('Type, title and content are required')
  }

  const adminService = new AdminService(createServiceRoleClient())
  const news = await adminService.createNews(body)
  return ApiResponseBuilder.success(news)
})

export const PATCH = withErrorHandler(async (req: NextRequest) => {
  await requireSuperAdmin()
  const body: UpdateNewsDto & { id?: string } = await req.json()

  if (!body.id) {
    return ApiResponseBuilder.badRequest('id is required')
  }

  const { id, ...updates } = body
  const adminService = new AdminService(createServiceRoleClient())
  const news = await adminService.updateNews(id, updates)
  return ApiResponseBuilder.success(news)
})

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  await requireSuperAdmin()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return ApiResponseBuilder.badRequest('id is required')
  }

  const adminService = new AdminService(createServiceRoleClient())
  await adminService.deleteNews(id)
  return ApiResponseBuilder.success({ deleted: true })
})
