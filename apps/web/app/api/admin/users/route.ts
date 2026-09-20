import type { NextRequest } from 'next/server'
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

  const adminService = new AdminService(createServiceRoleClient())
  const result = await adminService.listUsers(page, pageSize)

  return ApiResponseBuilder.success(result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  })
})

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  await requireSuperAdmin()
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return ApiResponseBuilder.badRequest('userId is required')
  }

  const adminService = new AdminService(createServiceRoleClient())
  await adminService.deleteUser(userId)

  return ApiResponseBuilder.success({ deleted: true })
})
