import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params

    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .select('id, title, description, cover')
      .eq('id', id)
      .single()

    if (novelError) throw novelError

    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', id)
      .eq('status', 'published')
      .order('order_index', { ascending: true })

    if (chaptersError) throw chaptersError

    return ApiResponseBuilder.success({
      ...novel,
      chapters: chapters || [],
    })
  },
)
