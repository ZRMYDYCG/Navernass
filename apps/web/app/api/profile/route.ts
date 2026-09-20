import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function normalizeNullableText(value: unknown): unknown {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'string') return value

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

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

  const username = normalizeNullableText(body.username)
  const fullName = normalizeNullableText(body.full_name)
  const website = normalizeNullableText(body.website)
  const avatarUrl = normalizeNullableText(body.avatar_url)

  if (username !== undefined) updateData.username = username
  if (fullName !== undefined) updateData.full_name = fullName
  if (website !== undefined) updateData.website = website
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl

  if (Object.keys(updateData).length === 0) {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    if (existingProfile) {
      return NextResponse.json(existingProfile, { status: 200 })
    }

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert({ id: user.id })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    return NextResponse.json(createdProfile, { status: 200 })
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .maybeSingle()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  if (updatedProfile) {
    return NextResponse.json(updatedProfile, { status: 200 })
  }

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      ...updateData,
    })
    .select()
    .single()

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  return NextResponse.json(createdProfile, { status: 200 })
}
