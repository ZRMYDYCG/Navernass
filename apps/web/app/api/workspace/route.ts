import { WorkspaceService } from '@/lib/supabase/sdk/services/workspace.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(async () => {
  const supabase = await createClient()
  const workspaceService = new WorkspaceService(supabase)
  const stats = await workspaceService.getStats()
  return ApiResponseBuilder.success(stats)
})
