import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  listMarketplaceSkills,
  setSkillInstalled,
} from '@/lib/skills/skills.service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const skills = await listMarketplaceSkills(user.id)
    return NextResponse.json({ skills })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load skills'
    console.error('[GET /api/skills]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const skillId = typeof body.skillId === 'string' ? body.skillId : ''
  const enabled = typeof body.enabled === 'boolean' ? body.enabled : null

  if (!skillId || enabled === null) {
    return NextResponse.json({ error: 'skillId and enabled are required' }, { status: 400 })
  }

  try {
    await setSkillInstalled(user.id, skillId, enabled)
    const skills = await listMarketplaceSkills(user.id)
    return NextResponse.json({ skills })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update skill'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
