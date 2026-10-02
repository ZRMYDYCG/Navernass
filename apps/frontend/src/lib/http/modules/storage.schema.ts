import { z } from "zod";

/** 头像、封面等图片上传允许的类型，与后端 storage 白名单中的图片部分一致。 */
export const imageContentTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const presignedUploadSchema = z.object({
  key: z.string(),
  uploadUrl: z.string(),
  url: z.string(),
  expiresIn: z.number(),
});

export const confirmedUploadSchema = z.object({
  key: z.string(),
  url: z.string(),
  contentType: z.string(),
  size: z.number(),
});
