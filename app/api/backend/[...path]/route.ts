import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const excludedRequestHeaders = new Set(['connection', 'content-length', 'host'])

function getBackendBaseUrl(): string {
  return (process.env.NEST_API_URL || 'http://127.0.0.1:3001/api').replace(/\/$/, '')
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const target = new URL(`${getBackendBaseUrl()}/${path.map(encodeURIComponent).join('/')}`)
  target.search = request.nextUrl.search

  const headers = new Headers()
  request.headers.forEach((value, name) => {
    if (!excludedRequestHeaders.has(name.toLowerCase())) headers.set(name, value)
  })

  try {
    return await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.arrayBuffer(),
      cache: 'no-store',
      signal: request.signal,
    })
  } catch (error) {
    console.error('[backend-proxy] request failed:', error)
    return new Response('Backend service unavailable', { status: 503 })
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
