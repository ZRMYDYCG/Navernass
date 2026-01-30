import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient(request)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth callback error:', error)
      const errorMessage = encodeURIComponent(error.message)
      return NextResponse.redirect(new URL(`/auth/verify-success?error=${errorMessage}`, request.url))
    } else {
      const redirectUrl = new URL('/auth/verify-success?status=success', request.url)
      redirectUrl.searchParams.set('timestamp', Date.now().toString())
      return NextResponse.redirect(redirectUrl)
    }
  } else {
    const errorMessage = encodeURIComponent('Missing authorization code')
    return NextResponse.redirect(new URL(`/auth/verify-success?error=${errorMessage}`, request.url))
  }
}
