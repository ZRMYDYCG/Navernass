import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteCustomSkill, getCustomSkill, listMarketplaceSkills } from '@/lib/skills/skills.service'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const skill = await getCustomSkill(user.id, id)
  if (!skill) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ skill })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    await deleteCustomSkill(user.id, id)
    const skills = await listMarketplaceSkills(user.id)
    return NextResponse.json({ skills })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete custom skill'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
