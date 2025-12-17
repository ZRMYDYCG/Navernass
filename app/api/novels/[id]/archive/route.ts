import type { NextRequest } from 'next/server'
import { NovelsService } from '@/lib/supabase/sdk/services/novels.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const POST = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const novelsService = new NovelsService(supabase)
    const { id } = await params
    const novel = await novelsService.archive(id)
    return ApiResponseBuilder.success(novel)
  },
)
