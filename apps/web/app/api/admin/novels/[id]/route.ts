import type { NextRequest } from 'next/server'
import { requireSuperAdmin } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { AdminService } from '@/lib/supabase/sdk/services/admin.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export const DELETE = withErrorHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await requireSuperAdmin()
  const { id } = await params
  const adminService = new AdminService(createServiceRoleClient())
  await adminService.deleteNovel(id)
  return ApiResponseBuilder.success({ deleted: true })
})
