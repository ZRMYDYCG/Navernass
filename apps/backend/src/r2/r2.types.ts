/** 允许上传的 MIME 类型白名单，新类型在此扩展即可。 */
export const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

export type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

/** 各 MIME 类型允许的扩展名，首位为规范扩展名；用于校验并回落原始文件扩展名。 */
export const EXTENSIONS_BY_CONTENT_TYPE: Record<
  AllowedContentType,
  readonly [string, ...string[]]
> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
  "application/pdf": ["pdf"],
};

/** 上传对象必须位于此前缀下，其余 key 一律拒绝。 */
export const UPLOADS_PREFIX = "uploads/";

/** Presigned URL 有效期（秒）。 */
export const PRESIGN_EXPIRES_SECONDS = 600;

/** 单文件大小上限（字节），默认 10 MB。 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** 创建直传 URL 接口的返回：key/url 入库，uploadUrl 仅供浏览器 PUT。 */
export interface PresignedUpload {
  key: string;
  uploadUrl: string;
  url: string;
  expiresIn: number;
}

/** 确认上传接口的返回：业务库应保存 key，展示时经 getPublicUrl 拼接。 */
export interface ConfirmedUpload {
  key: string;
  url: string;
  contentType: AllowedContentType;
  size: number;
}
