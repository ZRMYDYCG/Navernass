import type { Input, Options } from "ky";
import type { z } from "zod";

import { apiEnvelopeSchema } from "@/schemas/api.schema";

import { apiClient } from "./client";

/** 拆开业务接口信封并用 Zod 校验 `data`，防止后端数据漂移污染业务状态。 */
export async function apiRequest<TSchema extends z.ZodType>(
  input: Input,
  schema: TSchema,
  options?: Options,
): Promise<z.output<TSchema>> {
  const body = await apiClient(input, options).text();
  // Nest 对 null 结果输出空响应体，不带信封。
  if (!body) return schema.parse(null);
  return schema.parse(apiEnvelopeSchema.parse(JSON.parse(body)).data);
}
