import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AppError } from "../common/app-error.js";
import { ErrorCode } from "../common/error-codes.js";
import type { EnvConfig } from "../config/env-schema.js";
import * as schema from "./storage.schema.js";
import {
  ALLOWED_CONTENT_TYPES,
  EXTENSIONS_BY_CONTENT_TYPE,
  MAX_FILE_SIZE_BYTES,
  PRESIGN_EXPIRES_SECONDS,
  UPLOADS_PREFIX,
  type AllowedContentType,
  type ConfirmedUpload,
  type PresignedUpload,
} from "./storage.types.js";

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  /** 去掉尾斜线的公开访问基址，例如 https://files.example.com。 */
  private readonly publicBaseUrl: string;

  constructor(@Inject(ConfigService) config: ConfigService<EnvConfig, true>) {
    this.client = new S3Client({
      region: config.get("S3_REGION", { infer: true }),
      endpoint: config.get("S3_ENDPOINT", { infer: true }),
      credentials: {
        accessKeyId: config.get("S3_ACCESS_KEY_ID", { infer: true }),
        secretAccessKey: config.get("S3_SECRET_ACCESS_KEY", { infer: true }),
      },
      // SDK 默认会把空 body 的 CRC32 写进 Presigned URL，浏览器上传真实内容时校验必然失败。
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
    this.bucket = config.get("S3_BUCKET", { infer: true });
    this.publicBaseUrl = config.get("S3_PUBLIC_BASE_URL", { infer: true }).replace(/\/+$/, "");
  }

  /** 生成浏览器直传用的 Presigned PUT URL。类型与大小在服务层再次校验，不信任调用方。 */
  async createPresignedUploadUrl(input: schema.CreateUploadUrlInput): Promise<PresignedUpload> {
    if (!this.isAllowedContentType(input.contentType)) {
      throw new AppError(ErrorCode.STORAGE_CONTENT_TYPE_NOT_ALLOWED, "不支持的文件类型", 400);
    }
    if (input.fileSize > MAX_FILE_SIZE_BYTES) {
      throw new AppError(ErrorCode.STORAGE_FILE_TOO_LARGE, "文件大小超出限制", 400);
    }

    const key = this.buildObjectKey(input.contentType, input.filename);
    // ContentType 写入签名：浏览器 PUT 时的 Content-Type 必须与之一致，否则存储服务拒绝。
    // 不签名 ContentLength：大小以 confirm 时的 HEAD 实测为准，避免签名头与浏览器行为冲突。
    const uploadUrl = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: input.contentType,
      }),
      { expiresIn: PRESIGN_EXPIRES_SECONDS, signableHeaders: new Set(["content-type"]) },
    );
    return {
      key,
      uploadUrl,
      url: this.getPublicUrl(key),
      expiresIn: PRESIGN_EXPIRES_SECONDS,
    };
  }

  /** 确认上传完成：HEAD 实际对象并与声明比对，不一致（类型/大小篡改）则自动删除。 */
  async confirmUpload(input: schema.ConfirmUploadInput): Promise<ConfirmedUpload> {
    this.validateObjectKey(input.key);

    let size: number;
    let contentType: string;
    try {
      const head = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: input.key }),
      );
      size = head.ContentLength ?? 0;
      contentType = head.ContentType ?? "";
    } catch (error) {
      if (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404) {
        throw new AppError(ErrorCode.STORAGE_UPLOAD_NOT_FOUND, "上传对象不存在", 404);
      }
      throw error;
    }

    if (contentType !== input.contentType || size !== input.fileSize) {
      await this.deleteObject(input.key);
      throw new AppError(
        ErrorCode.STORAGE_UPLOAD_INVALID,
        "上传内容与声明不一致，已删除该对象",
        400,
      );
    }

    // TODO: 校验当前登录用户是否拥有该文件（需要文件归属模型）。
    return {
      key: input.key,
      url: this.getPublicUrl(input.key),
      contentType: input.contentType,
      size,
    };
  }

  /** 删除 uploads/ 前缀下的对象。 */
  async deleteObject(key: string): Promise<void> {
    this.validateObjectKey(key);
    // TODO: 校验当前登录用户是否拥有该文件（需要文件归属模型）。
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  /** 拼接公开访问 URL：数据库只存 key，展示时用它换算，未来换 CDN 域名无需迁移数据。 */
  getPublicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key.replace(/^\/+/, "")}`;
  }

  isAllowedContentType(value: string): value is AllowedContentType {
    return (ALLOWED_CONTENT_TYPES as readonly string[]).includes(value);
  }

  /**
   * 校验客户端提交的对象 key：
   * 拒绝空 key、完整 URL（防伪造外链）、路径穿越（../），且只允许 uploads/ 前缀。
   */
  validateObjectKey(key: string): void {
    if (key.length === 0) {
      throw new AppError(ErrorCode.STORAGE_INVALID_OBJECT_KEY, "对象 key 不能为空", 400);
    }
    if (key.includes("://")) {
      throw new AppError(
        ErrorCode.STORAGE_INVALID_OBJECT_KEY,
        "请提交对象 key 而不是完整 URL",
        400,
      );
    }
    if (key.includes("..")) {
      throw new AppError(ErrorCode.STORAGE_INVALID_OBJECT_KEY, "对象 key 不允许路径穿越", 400);
    }
    if (!key.startsWith(UPLOADS_PREFIX)) {
      throw new AppError(
        ErrorCode.STORAGE_INVALID_OBJECT_KEY,
        "对象 key 必须位于 uploads/ 前缀下",
        400,
      );
    }
  }

  /** 生成日期分层 + UUID 命名的 key：uploads/YYYY/MM/DD/{uuid}.{ext}，文件名不可控。 */
  private buildObjectKey(contentType: AllowedContentType, filename?: string): string {
    const [year, month, day] = new Date().toISOString().slice(0, 10).split("-");
    const ext = this.resolveExtension(contentType, filename);
    return `${UPLOADS_PREFIX}${year}/${month}/${day}/${randomUUID()}.${ext}`;
  }

  /** 原始扩展名与 MIME 匹配时保留，否则回落到该类型的规范扩展名；取值来自白名单，天然免疫穿越。 */
  private resolveExtension(contentType: AllowedContentType, filename?: string): string {
    const allowed = EXTENSIONS_BY_CONTENT_TYPE[contentType];
    const original = filename?.split(".").pop()?.toLowerCase();
    return original !== undefined && allowed.includes(original) ? original : allowed[0];
  }
}
