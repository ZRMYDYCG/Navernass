import type { NextRequest } from 'next/server'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const volumesService = new VolumesService(supabase)
    const { id } = await params
    const chapters = await volumesService.getChapters(id)
    return ApiResponseBuilder.success(chapters)
  },
)
