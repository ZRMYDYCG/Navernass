import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabase = await createClient()
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

    const { data: volumes, error: volumesError } = await supabase
      .from('volumes')
      .select('*')
      .eq('novel_id', id)
      .order('order_index', { ascending: true })

    if (volumesError) throw volumesError

    return ApiResponseBuilder.success({
      ...novel,
      volumes: volumes || [],
      chapters: chapters || [],
    })
  },
)
