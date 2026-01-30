import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient(request)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // Supabase 在部分场景下会返回 "PKCE code verifier not found" 错误，但 Session 已经创建成功。
    // 若检测到此类错误，视为成功继续流程，避免向用户暴露无害错误信息。
    const isBenignPkceError
      = error && error.message?.toLowerCase().includes('pkce code verifier not found')

    if (error && !isBenignPkceError) {
      console.error('Auth callback error:', error)
      const errorMessage = encodeURIComponent(error.message)
      return NextResponse.redirect(
        new URL(`/auth/verify-success?error=${errorMessage}`, request.url),
      )
    }

    const redirectUrl = new URL('/auth/verify-success?status=success', request.url)
    redirectUrl.searchParams.set('timestamp', Date.now().toString())
    return NextResponse.redirect(redirectUrl)
  }

  const errorMessage = encodeURIComponent('Missing authorization code')
  return NextResponse.redirect(new URL(`/auth/verify-success?error=${errorMessage}`, request.url))
}
