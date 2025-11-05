import type { NextRequest } from 'next/server'
import { ApiResponseBuilder } from './response'

/**
 * 错误处理包装器
 */
export function withErrorHandler(
  handler: (req: NextRequest, context?: any) => Promise<any>,
) {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context)
    } catch (error: any) {
      console.error('API Error:', error)

      // Supabase 错误
      if (error.code && error.message && !error.statusCode) {
        return ApiResponseBuilder.error(
          error.message,
          error.code,
          400,
        )
      }

      // 自定义业务错误
      if (error.statusCode) {
        return ApiResponseBuilder.error(
          error.message,
          error.code || 'ERROR',
          error.statusCode,
          error.details,
        )
      }

      // 默认错误
      return ApiResponseBuilder.error(
        error.message || 'Internal server error',
        'INTERNAL_ERROR',
        500,
      )
    }
  }
}
