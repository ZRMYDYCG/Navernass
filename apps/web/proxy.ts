import type { NextRequest } from 'next/server'
import { buildAuthRedirect, isProtectedPath } from './proxy/auth-guard'
import { createProxyClient } from './proxy/supabase-client'

export async function proxy(request: NextRequest) {
  const { supabase, response } = createProxyClient(request)
  const { data: { session }, error } = await supabase.auth.getSession()

  if (isProtectedPath(request.nextUrl.pathname) && (!session || error)) {
    return buildAuthRedirect(request)
  }

  return response
}
