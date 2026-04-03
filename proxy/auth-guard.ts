import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/chat', '/novels', '/trash', '/writing']

export function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(path => pathname.startsWith(path))
}

export function buildAuthRedirect(request: NextRequest) {
  const redirectUrl = new URL('/', request.url)
  redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
  return NextResponse.redirect(redirectUrl)
}
