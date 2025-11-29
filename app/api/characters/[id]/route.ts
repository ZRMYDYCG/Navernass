import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'

export const GET = withErrorHandler(
  async () => {
    throw new Error('Not implemented')
  },
)

export const PUT = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const body = await req.json() as { novel_id: string } & Record<string, unknown>
    const { novel_id, ...updates } = body

    const { data: novel, error } = await supabase
      .from('novels')
      .select('characters')
      .eq('id', novel_id)
      .single()

    if (error) throw error

    const existing = (novel as { characters?: unknown }).characters
    const list: any[] = Array.isArray(existing) ? existing as any[] : []
    const index = list.findIndex(c => c && c.id === id)
    if (index === -1) {
      const notFound = new Error('Character not found') as Error & { statusCode?: number }
      notFound.statusCode = 404
      throw notFound
    }

    const merged = {
      ...list[index],
      ...updates,
    }

    const updatedList = [...list]
    updatedList[index] = merged

    const { error: updateError } = await supabase
      .from('novels')
      .update({ characters: updatedList })
      .eq('id', novel_id)

    if (updateError) throw updateError

    return ApiResponseBuilder.success(merged)
  },
)

export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const url = new URL(req.url)
    const novelId = url.searchParams.get('novelId')

    if (!novelId) {
      const err = new Error('novelId is required') as Error & { statusCode?: number }
      err.statusCode = 400
      throw err
    }

    const { data: novel, error } = await supabase
      .from('novels')
      .select('characters')
      .eq('id', novelId)
      .single()

    if (error) throw error

    const existing = (novel as { characters?: unknown }).characters
    const list: any[] = Array.isArray(existing) ? existing as any[] : []
    const updatedList = list.filter(c => !(c && c.id === id))

    const { error: updateError } = await supabase
      .from('novels')
      .update({ characters: updatedList })
      .eq('id', novelId)

    if (updateError) throw updateError

    return ApiResponseBuilder.success({ success: true })
  },
)
