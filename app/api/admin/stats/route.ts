import { requireSuperAdmin } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { AdminService } from '@/lib/supabase/sdk/services/admin.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export const GET = withErrorHandler(async () => {
  await requireSuperAdmin()
  const adminService = new AdminService(createServiceRoleClient())
  const stats = await adminService.getStats()
  return ApiResponseBuilder.success(stats)
})
