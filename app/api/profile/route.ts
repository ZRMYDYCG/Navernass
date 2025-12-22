import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 200 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const updateData: Record<string, unknown> = {}

  if (body.username !== undefined) updateData.username = body.username
  if (body.full_name !== undefined) updateData.full_name = body.full_name
  if (body.website !== undefined) updateData.website = body.website
  if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url

  const { data, error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 200 })
}
