/**
 * API 客户端工具
 */

interface FetchOptions extends RequestInit {
  // eslint-disable-next-line ts/no-explicit-any
  params?: Record<string, any>
}

async function fetchApi<T>(url: string, options?: FetchOptions): Promise<T> {
  // 处理查询参数
  let fullUrl = url
  if (options?.params) {
    const searchParams = new URLSearchParams()
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      fullUrl = `${url}?${queryString}`
    }
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const result = await response.json()

  if (!result.success) {
    const error = new Error(result.error?.message || 'Request failed') as Error & { code?: string, details?: unknown }
    error.code = result.error?.code
    error.details = result.error?.details
    throw error
  }

  if (result.meta) {
    return { data: result.data, ...result.meta } as T
  }

  return result.data
}

export const apiClient = {
  get: <T>(url: string, options?: FetchOptions) =>
    fetchApi<T>(url, { ...options, method: 'GET' }),

  // eslint-disable-next-line ts/no-explicit-any
  post: <T>(url: string, body?: any, options?: FetchOptions) =>
    fetchApi<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  // eslint-disable-next-line ts/no-explicit-any
  put: <T>(url: string, body?: any, options?: FetchOptions) =>
    fetchApi<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string, options?: FetchOptions) =>
    fetchApi<T>(url, { ...options, method: 'DELETE' }),
}
