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
      return NextResponse.redirect(new URL('/auth/verify-success', request.url))
    } else {
      console.log('Auth callback success:', data)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return NextResponse.redirect(new URL('/auth/verify-success', request.url))
}
