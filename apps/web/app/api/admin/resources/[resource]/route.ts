import type { NextRequest } from 'next/server'
import { ADMIN_RESOURCES, isAdminResourceId } from '@/lib/admin/resources'
import { requireSuperAdmin } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { AdminService } from '@/lib/supabase/sdk/services/admin.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) => {
  await requireSuperAdmin()
  const { resource } = await params

  if (!isAdminResourceId(resource)) {
    return ApiResponseBuilder.notFound('Resource')
  }

  const config = ADMIN_RESOURCES[resource]
  const { searchParams } = new URL(req.url)
  const page = Number.parseInt(searchParams.get('page') || '1', 10)
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '20', 10)

  const adminService = new AdminService(createServiceRoleClient())

  if (resource === 'users') {
    const result = await adminService.listUsers(page, pageSize)
    return ApiResponseBuilder.success(result.data, {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
    })
  }

  if (resource === 'novels') {
    const status = searchParams.get('status') || undefined
    const result = await adminService.listNovels(page, pageSize, status || undefined)
    return ApiResponseBuilder.success(result.data, {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
    })
  }

  const result = await adminService.listTable(config, page, pageSize)
  return ApiResponseBuilder.success(result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  })
})

export const DELETE = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) => {
  await requireSuperAdmin()
  const { resource } = await params
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return ApiResponseBuilder.badRequest('id is required')
  }

  const adminService = new AdminService(createServiceRoleClient())

  if (resource === 'users') {
    await adminService.deleteUser(id)
    return ApiResponseBuilder.success({ deleted: true })
  }

  if (resource === 'novels') {
    await adminService.deleteNovel(id)
    return ApiResponseBuilder.success({ deleted: true })
  }

  if (resource === 'news') {
    await adminService.deleteNews(id)
    return ApiResponseBuilder.success({ deleted: true })
  }

  if (!isAdminResourceId(resource) || !ADMIN_RESOURCES[resource].table) {
    return ApiResponseBuilder.notFound('Resource')
  }

  await adminService.deleteTableRow(ADMIN_RESOURCES[resource].table!, id)
  return ApiResponseBuilder.success({ deleted: true })
})
