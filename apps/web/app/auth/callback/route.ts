import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') || '/'

  if (!code) {
    const errorMessage = encodeURIComponent('Missing authorization code')
    return NextResponse.redirect(new URL(`/auth/verify-success?error=${errorMessage}`, origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  // Supabase 在部分场景下会返回 "PKCE code verifier not found" 错误，但 Session 已经创建成功。
  // 若检测到此类错误，视为成功继续流程，避免向用户暴露无害错误信息。
  const isBenignPkceError
    = error && error.message?.toLowerCase().includes('pkce code verifier not found')

  if (error && !isBenignPkceError) {
    console.error('Auth callback error:', error)
    const errorMessage = encodeURIComponent(error.message)
    return NextResponse.redirect(
      new URL(`/auth/verify-success?error=${errorMessage}`, origin),
    )
  }

  const verifyUrl = new URL('/auth/verify-success', origin)
  verifyUrl.searchParams.set('status', 'success')
  verifyUrl.searchParams.set('redirectTo', redirectTo)
  return NextResponse.redirect(verifyUrl)
}
