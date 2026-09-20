import type { NextRequest } from 'next/server'
import { CharactersService } from '@/lib/supabase/sdk/services/characters.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
    const charactersService = new CharactersService(supabase)
    const { id } = await params
    const characters = await charactersService.getByNovelId(id)
    return ApiResponseBuilder.success(characters)
  },
)
