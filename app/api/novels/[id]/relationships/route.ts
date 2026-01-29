import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RelationshipsService } from '@/lib/supabase/sdk/services/relationships.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const relationshipsService = new RelationshipsService(supabase)

    const { id } = await params

    if (!id) {
      return ApiResponseBuilder.error('Missing novel id', 'INVALID_DATA', 400)
    }

    const relationships = await relationshipsService.getByNovelId(id)
    return ApiResponseBuilder.success(relationships)
  },
)

