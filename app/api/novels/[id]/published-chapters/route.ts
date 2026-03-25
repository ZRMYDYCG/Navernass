import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase server environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { id } = await params

    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .select('id, title, description, cover, published_at')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (novelError) throw novelError

    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', id)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('order_index', { ascending: true })

    if (chaptersError) throw chaptersError

    const { data: volumes, error: volumesError } = await supabase
      .from('volumes')
      .select('*')
      .eq('novel_id', id)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })

    if (volumesError) throw volumesError

    return ApiResponseBuilder.success({
      ...novel,
      volumes: volumes || [],
      chapters: chapters || [],
    })
  },
)
