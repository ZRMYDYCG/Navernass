import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(request?: Request) {
  if (!request) {
    const cookieStore = await cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              )
            } catch {
            }
          },
        },
      },
    )
  }

  const cookieHeader = request.headers.get('cookie') || ''
  const parsedCookies = Object.fromEntries(
    cookieHeader.split(';').map((v) => {
      const [key, ...value] = v.trim().split('=')
      return [key, value.join('=')]
    }),
  )

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(parsedCookies).map(([name, value]) => ({ name, value }))
        },
        setAll() {
        },
      },
    },
  )
}
