import { apiErrorSchema, type ApiErrorPayload } from "@/schemas/api.schema";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

/** AI SDK 的流式 transport 会把错误响应体原样放进 `Error.message`。 */
export function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "未知错误";
  const payload = apiErrorSchema.safeParse(parseJson(error.message));
  return payload.success ? payload.data.message : error.message;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
