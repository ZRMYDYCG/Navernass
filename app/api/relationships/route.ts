'use server'

import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase/server'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import type { CreateRelationshipDto, Relationship } from '@/lib/supabase/sdk/types'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const payload = (await req.json()) as CreateRelationshipDto

  const {
    novel_id: novelId,
    sourceId,
    targetId,
    sourceToTargetLabel,
    targetToSourceLabel,
    note,
  } = payload

  if (!novelId || !sourceId || !targetId || !sourceToTargetLabel || !targetToSourceLabel) {
    return ApiResponseBuilder.error('Missing required fields', 'INVALID_DATA', 400)
  }
  if (sourceId === targetId) {
    return ApiResponseBuilder.error('Source and target cannot be the same', 'INVALID_DATA', 400)
  }

  const supabase = await createClient()

  // fetch current relationships array
  const { data: novelData, error: fetchErr } = await supabase
    .from('novels')
    .select('relationships')
    .eq('id', novelId)
    .single()

  if (fetchErr) throw fetchErr

  const current: Relationship[] = Array.isArray(novelData.relationships) ? novelData.relationships : []

  const newRelationship: Relationship = {
    id: uuidv4(),
    novel_id: novelId,
    sourceId,
    targetId,
    sourceToTargetLabel,
    targetToSourceLabel,
    note: note ?? '',
  }

  const updated = [...current, newRelationship]

  const { error: updateErr } = await supabase
    .from('novels')
    .update({ relationships: updated })
    .eq('id', novelId)

  if (updateErr) throw updateErr

  return ApiResponseBuilder.success(newRelationship)
})