import type { Input, Options } from "ky";
import { HTTPError } from "ky";
import type { z } from "zod";

import { apiEnvelopeSchema, apiErrorSchema } from "@/lib/http/modules/api.schema";

import { apiClient } from "./client";
import { ApiError } from "./error";

/** 拆开业务接口信封并用 Zod 校验 `data`，防止后端数据漂移污染业务状态。 */
export async function apiRequest<TSchema extends z.ZodType>(
  input: Input,
  schema: TSchema,
  options?: Options,
): Promise<z.output<TSchema>> {
  try {
    const body = await apiClient(input, options).text();
    // Nest 对 null 结果输出空响应体，不带信封。
    if (!body) return schema.parse(null);
    return schema.parse(apiEnvelopeSchema.parse(JSON.parse(body)).data);
  } catch (error) {
    if (!(error instanceof HTTPError)) throw error;
    const text = await error.response.text();
    const parsed = apiErrorSchema.safeParse(parseJson(text));
    if (parsed.success) {
      throw new ApiError(error.response.status, parsed.data);
    }
    throw error;
  }
}

function parseJson(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}
