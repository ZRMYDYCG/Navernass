import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CUSTOM_SKILL_TEMPLATE } from '@/lib/skills/custom-skill-template'
import {
  getCustomSkill,
  listMarketplaceSkills,
  normalizeCustomSkillInput,
  setCustomSkillEnabled,
  upsertCustomSkill,
} from '@/lib/skills/skills.service'

export async function GET() {
  return NextResponse.json({ template: CUSTOM_SKILL_TEMPLATE })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  try {
    normalizeCustomSkillInput(body)
    const row = await upsertCustomSkill(user.id, body, supabase)
    try {
      const skills = await listMarketplaceSkills(user.id)
      return NextResponse.json({ skill: row, skills })
    } catch (listError) {
      console.warn('[skills/custom POST] saved but list failed:', listError)
      return NextResponse.json({
        skill: row,
        skills: [],
        warning: listError instanceof Error ? listError.message : 'Saved, but failed to refresh list',
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create custom skill'
    console.error('[POST /api/skills/custom]', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const id = typeof body.id === 'string' ? body.id : ''
  const enabled = typeof body.enabled === 'boolean' ? body.enabled : undefined

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  if (enabled !== undefined && body.skillMd === undefined && body.name === undefined) {
    try {
      await setCustomSkillEnabled(user.id, id, enabled)
      const skills = await listMarketplaceSkills(user.id)
      return NextResponse.json({ skills })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update custom skill'
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  try {
    const row = await upsertCustomSkill(user.id, { ...body, id }, supabase)
    try {
      const skills = await listMarketplaceSkills(user.id)
      return NextResponse.json({ skill: row, skills })
    } catch (listError) {
      console.warn('[skills/custom PATCH] saved but list failed:', listError)
      return NextResponse.json({
        skill: row,
        skills: [],
        warning: listError instanceof Error ? listError.message : 'Saved, but failed to refresh list',
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update custom skill'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
