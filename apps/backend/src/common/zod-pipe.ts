import { Injectable, type PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";
import { AppError } from "./app-error.js";

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new AppError("VALIDATION_ERROR", "请求参数校验失败", 422, result.error.flatten());
    }
    return result.data;
  }
}
