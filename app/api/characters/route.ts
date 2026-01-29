import type { NextRequest } from 'next/server'
import type { CreateCharacterDto } from '@/lib/supabase/sdk/types'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()

  const body: CreateCharacterDto = await req.json()
  const { novel_id, name, role, avatar, description, traits, keywords, first_appearance, note, order_index, overview_x, overview_y } = body

  const { data: novel, error } = await supabase
    .from('novels')
    .select('characters')
    .eq('id', novel_id)
    .single()

  if (error) throw error

  const existing = (novel as { characters?: unknown }).characters
  const list: unknown[] = Array.isArray(existing) ? existing : []

  const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const newCharacter = {
    id,
    name,
    role: role || '',
    avatar: avatar || '',
    description: description || '',
    traits: traits ?? [],
    keywords: keywords ?? [],
    first_appearance: first_appearance || '',
    note: note || '',
    order_index: order_index ?? list.length,
    overview_x: overview_x ?? null,
    overview_y: overview_y ?? null,
  }

  const updated = [...list, newCharacter]

  const { error: updateError } = await supabase
    .from('novels')
    .update({ characters: updated })
    .eq('id', novel_id)

  if (updateError) throw updateError

  return ApiResponseBuilder.success(newCharacter)
})
