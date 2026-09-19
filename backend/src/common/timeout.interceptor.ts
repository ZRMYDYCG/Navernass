import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import type { Observable } from 'rxjs'
import { Inject, Injectable, RequestTimeoutException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { catchError, throwError, timeout, TimeoutError } from 'rxjs'
import { LONG_TASK_KEY } from './raw-response.js'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (this.reflector.getAllAndOverride<boolean>(LONG_TASK_KEY, [context.getHandler(), context.getClass()])) {
      return next.handle()
    }
    return next.handle().pipe(
      timeout(30_000),
      catchError(error => throwError(() => error instanceof TimeoutError
        ? new RequestTimeoutException('请求处理超时')
        : error)),
    )
  }
}
