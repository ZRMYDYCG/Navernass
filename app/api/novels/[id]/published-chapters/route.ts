import type { NextRequest } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = supabaseUrl && supabaseServiceRoleKey
      ? createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })
      : await createClient()

    const { id } = await params

    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .select('id, title, description, cover, published_at')
      .eq('id', id)
      .eq('status', 'published')
      .maybeSingle()

    if (novelError) throw novelError
    if (!novel) {
      return ApiResponseBuilder.error('小说不存在或未发布', 'NOVEL_NOT_FOUND', 404)
    }

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
