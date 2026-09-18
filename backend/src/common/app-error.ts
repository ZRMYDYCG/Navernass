import { HttpStatus } from '@nestjs/common'
import type { ErrorCode } from './error-codes.js'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number = HttpStatus.BAD_REQUEST,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }

  static notFound(code: ErrorCode, resource: string) {
    return new AppError(code, `${resource}不存在`, HttpStatus.NOT_FOUND)
  }

  static forbidden(message = '没有权限执行此操作') {
    return new AppError('FORBIDDEN', message, HttpStatus.FORBIDDEN)
  }
}
