import { z } from "zod";

import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE_BYTES } from "./storage.types.js";

export const createUploadUrl = z.object({
  /** 期望的文件 MIME 类型，必须在白名单内。 */
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  /** 文件字节数，浏览器直传前后均会校验。 */
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
  /** 原始文件名，仅用于尽量保留合法扩展名，不参与对象命名。 */
  filename: z.string().trim().min(1).max(255).optional(),
});

export const confirmUpload = z.object({
  key: z.string().min(1).max(1024),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
});

export const deleteFile = z.object({
  key: z.string().min(1).max(1024),
});

export type CreateUploadUrlInput = z.infer<typeof createUploadUrl>;
export type ConfirmUploadInput = z.infer<typeof confirmUpload>;
export type DeleteFileInput = z.infer<typeof deleteFile>;
