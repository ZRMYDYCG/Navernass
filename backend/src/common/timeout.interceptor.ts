import { CallHandler, ExecutionContext, Injectable, RequestTimeoutException, type NestInterceptor } from '@nestjs/common'
import { catchError, throwError, timeout, TimeoutError, type Observable } from 'rxjs'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(30_000),
      catchError(error => throwError(() => error instanceof TimeoutError
        ? new RequestTimeoutException('请求处理超时')
        : error)),
    )
  }
}
