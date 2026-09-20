import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    // 已经无 session 时 supabase 会回错误，这种情况视为已登出。
    if (error && !/session.*missing/i.test(error.message ?? '')) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('server signout failed:', err)
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 })
  }
}
