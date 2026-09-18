import { CallHandler, ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common'
import { map, type Observable } from 'rxjs'
import { ApiResult } from './api-result.js'
import type { AuthRequest } from './current-user.js'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthRequest>()
    return next.handle().pipe(map((value: unknown) => {
      if (value === undefined || value === null) return value
      if (isEnvelope(value)) return value
      const result = value instanceof ApiResult ? value : new ApiResult(value)
      return {
        success: true,
        data: result.data,
        ...(result.meta && { meta: result.meta }),
        requestId: request.requestId,
        timestamp: new Date().toISOString(),
      }
    }))
  }
}

function isEnvelope(value: unknown): value is { success: boolean } {
  return typeof value === 'object' && value !== null && 'success' in value
}
