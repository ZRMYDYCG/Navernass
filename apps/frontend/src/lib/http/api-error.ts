import type { ApiErrorPayload } from "@/schemas/api.schema"

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message)
    this.name = "ApiError"
    this.status = status
    this.code = payload.code
    this.details = payload.details
  }
}
