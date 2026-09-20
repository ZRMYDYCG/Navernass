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
  const status = searchParams.get('status') || undefined

  const adminService = new AdminService(createServiceRoleClient())
  const result = await adminService.listNovels(page, pageSize, status || undefined)

  return ApiResponseBuilder.success(result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  })
})
