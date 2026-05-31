import { getServerAdminContext, isConfiguredSuperAdminEmail, syncSuperAdminProfile } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ user: null, profile: null, isSuperAdmin: false }, { status: 200 })
  }

  let profile = null

  if (isConfiguredSuperAdminEmail(user.email)) {
    profile = await syncSuperAdminProfile(user)
  } else {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileError) {
      profile = data
    }
  }

  const adminContext = await getServerAdminContext()

  return NextResponse.json({
    user,
    profile,
    isSuperAdmin: Boolean(adminContext),
  }, { status: 200 })
}
