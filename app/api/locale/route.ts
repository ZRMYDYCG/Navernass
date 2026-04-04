import { NextResponse } from 'next/server'
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE_KEY,
  type Locale,
} from '@/i18n/config'

function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const locale = body?.locale

  const safeLocale = typeof locale === 'string' && isValidLocale(locale)
    ? locale
    : DEFAULT_LOCALE

  const response = NextResponse.json({ success: true })

  response.cookies.set(LOCALE_COOKIE_KEY, safeLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  return response
}
