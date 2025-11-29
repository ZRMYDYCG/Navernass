import type { NextRequest } from 'next/server'
import { CharactersService } from '@/lib/supabase/sdk/services/characters.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

const charactersService = new CharactersService()

export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const characters = await charactersService.getByNovelId(id)
    return ApiResponseBuilder.success(characters)
  },
)
