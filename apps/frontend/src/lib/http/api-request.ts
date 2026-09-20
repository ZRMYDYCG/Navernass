import type { Input, Options } from "ky"
import type { z } from "zod"

import { apiClient } from "./api-client"

// 所有响应通过 Zod 边界校验，防止后端数据漂移污染业务状态
export async function apiRequest<TSchema extends z.ZodType>(
  input: Input,
  schema: TSchema,
  options?: Options
): Promise<z.output<TSchema>> {
  const payload: unknown = await apiClient(input, options).json()
  return schema.parse(payload)
}
