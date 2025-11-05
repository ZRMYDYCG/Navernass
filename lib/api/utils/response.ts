import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

export class ApiResponseBuilder {
  static success<T>(data: T, meta?: ApiResponse['meta']): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      ...(meta && { meta }),
    })
  }

  static error(
    message: string,
    code: string = 'INTERNAL_ERROR',
    status: number = 500,
    details?: any,
  ): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          details,
        },
      },
      { status },
    )
  }

  static notFound(resource: string = 'Resource'): NextResponse<ApiResponse> {
    return this.error(`${resource} not found`, 'NOT_FOUND', 404)
  }

  static badRequest(message: string, details?: any): NextResponse<ApiResponse> {
    return this.error(message, 'BAD_REQUEST', 400, details)
  }
}
