import { getServerAdminContext } from '@/lib/admin-auth'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export async function GET() {
  const context = await getServerAdminContext()

  if (!context) {
    return ApiResponseBuilder.success({
      isSuperAdmin: false,
      user: null,
      profile: null,
    })
  }

  return ApiResponseBuilder.success({
    isSuperAdmin: true,
    user: {
      id: context.user.id,
      email: context.user.email,
    },
    profile: context.profile,
  })
}
