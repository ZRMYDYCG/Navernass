import type { ErrorCodeName } from './error-codes.js'
import { HttpStatus } from '@nestjs/common'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCodeName,
    message: string,
    public readonly status: number = HttpStatus.BAD_REQUEST,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }

  static notFound(code: ErrorCodeName, resource: string) {
    return new AppError(code, `${resource}不存在`, HttpStatus.NOT_FOUND)
  }

  static forbidden(message = '没有权限执行此操作') {
    return new AppError('FORBIDDEN', message, HttpStatus.FORBIDDEN)
  }
}
