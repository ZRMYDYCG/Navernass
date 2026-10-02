import { DeleteObjectCommand, PutObjectCommand, S3ServiceException } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EnvConfig } from "../src/config/env-schema.js";
import * as schema from "../src/r2/r2.schema.js";
import { R2Service } from "../src/r2/r2.service.js";
import { MAX_FILE_SIZE_BYTES } from "../src/r2/r2.types.js";

const { getSignedUrlMock, sendMock } = vi.hoisted(() => ({
  getSignedUrlMock: vi.fn(),
  sendMock: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => {
  class MockCommand {
    constructor(readonly input: Record<string, unknown>) {}
  }
  class MockS3ServiceException extends Error {
    $metadata: { httpStatusCode?: number };
    constructor(options: { message?: string; $metadata?: { httpStatusCode?: number } } | string) {
      super(typeof options === "string" ? options : (options.message ?? "S3 error"));
      this.$metadata = typeof options === "string" ? {} : (options.$metadata ?? {});
    }
  }
  return {
    S3Client: class {
      send = sendMock;
    },
    S3ServiceException: MockS3ServiceException,
    PutObjectCommand: MockCommand,
    HeadObjectCommand: MockCommand,
    DeleteObjectCommand: MockCommand,
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: getSignedUrlMock,
}));

function createService(overrides: Record<string, string> = {}) {
  const env: Record<string, string> = {
    R2_ACCOUNT_ID: "account-id",
    R2_ACCESS_KEY_ID: "access-key",
    R2_SECRET_ACCESS_KEY: "secret-key",
    R2_BUCKET: "bucket",
    R2_PUBLIC_BASE_URL: "https://files.example.com/",
    ...overrides,
  };
  const config = {
    get: (key: string) => env[key],
  } as unknown as ConfigService<EnvConfig, true>;
  return new R2Service(config);
}

/** 取第 index 次客户端调用收到的 command 实例。 */
function sentCommand(index: number): unknown {
  const call = sendMock.mock.calls[index];
  return call !== undefined && call.length > 0 ? call[0] : undefined;
}

const VALID_KEY = "uploads/2026/10/02/9f1c2a1e-1111-4222-8333-444455556666.png";

describe("R2Service", () => {
  beforeEach(() => {
    sendMock.mockReset();
    getSignedUrlMock.mockReset();
    getSignedUrlMock.mockResolvedValue("https://presigned.example.com/put");
  });

  describe("对象 key 校验", () => {
    it.each([
      ["空 key", ""],
      ["完整 URL", "https://files.example.com/uploads/a.png"],
      ["路径穿越", "uploads/../secrets/token.png"],
      ["越权前缀", "backups/db.sql"],
      ["绝对路径", "/uploads/a.png"],
    ])("拒绝%s", async (_name, key) => {
      const service = createService();
      await expect(service.deleteObject(key)).rejects.toMatchObject({
        code: "R2_INVALID_OBJECT_KEY",
      });
      expect(sendMock).not.toHaveBeenCalled();
    });

    it("接受 uploads/ 下的合法 key", async () => {
      const service = createService();
      await service.deleteObject(VALID_KEY);
      expect(sendMock).toHaveBeenCalledTimes(1);
      const command = sentCommand(0) as DeleteObjectCommand;
      expect(command).toBeInstanceOf(DeleteObjectCommand);
      expect(command.input.Key).toBe(VALID_KEY);
    });
  });

  describe("MIME 白名单", () => {
    it.each(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"])(
      "放行 %s",
      (contentType) => {
        expect(createService().isAllowedContentType(contentType)).toBe(true);
      },
    );

    it.each(["video/mp4", "text/html", "application/zip", ""])("拒绝 %s", (contentType) => {
      expect(createService().isAllowedContentType(contentType)).toBe(false);
    });

    it("创建直传 URL 时拒绝白名单外的类型", async () => {
      const service = createService();
      const input = {
        contentType: "video/mp4",
        fileSize: 1024,
      } as unknown as schema.CreateUploadUrlInput;
      await expect(service.createPresignedUploadUrl(input)).rejects.toMatchObject({
        code: "R2_CONTENT_TYPE_NOT_ALLOWED",
      });
      expect(getSignedUrlMock).not.toHaveBeenCalled();
    });
  });

  describe("创建直传 URL", () => {
    it("生成日期分层 + UUID 命名的 key 与公开 URL", async () => {
      const service = createService();
      const result = await service.createPresignedUploadUrl({
        contentType: "image/png",
        fileSize: 1024,
        filename: "photo.png",
      });
      expect(result.key).toMatch(
        /^uploads\/\d{4}\/\d{2}\/\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/,
      );
      // 环境变量里的基址带尾斜线，拼接结果不能出现双斜线
      expect(result.url).toBe(`https://files.example.com/${result.key}`);
      expect(result.uploadUrl).toBe("https://presigned.example.com/put");
      expect(result.expiresIn).toBe(600);
    });

    it("按 ContentType 与 10 分钟有效期签名 PutObjectCommand", async () => {
      const service = createService();
      await service.createPresignedUploadUrl({
        contentType: "image/webp",
        fileSize: 2048,
        filename: "pic.webp",
      });
      expect(getSignedUrlMock).toHaveBeenCalledTimes(1);
      const [, command, options] = getSignedUrlMock.mock.calls[0] as [
        unknown,
        PutObjectCommand,
        { expiresIn: number },
      ];
      expect(command).toBeInstanceOf(PutObjectCommand);
      expect(command.input.Bucket).toBe("bucket");
      expect(command.input.ContentType).toBe("image/webp");
      expect(command.input.Key).toMatch(/^uploads\//);
      expect(options.expiresIn).toBe(600);
    });

    it("保留与 MIME 匹配的原始扩展名，其余回落到规范扩展名", async () => {
      const service = createService();
      const keep = await service.createPresignedUploadUrl({
        contentType: "image/jpeg",
        fileSize: 1,
        filename: "photo.JPEG",
      });
      const alias = await service.createPresignedUploadUrl({
        contentType: "image/jpeg",
        fileSize: 1,
        filename: "photo.jpg",
      });
      const fallback = await service.createPresignedUploadUrl({
        contentType: "image/jpeg",
        fileSize: 1,
        filename: "photo.png",
      });
      expect(keep.key.endsWith(".jpeg")).toBe(true);
      expect(alias.key.endsWith(".jpg")).toBe(true);
      expect(fallback.key.endsWith(".jpg")).toBe(true);
    });

    it("文件名无法影响 key 结构，不产生路径穿越", async () => {
      const service = createService();
      const result = await service.createPresignedUploadUrl({
        contentType: "image/gif",
        fileSize: 1,
        filename: "../../.ssh/id_rsa.gif",
      });
      expect(result.key).not.toContain("..");
      expect(result.key).toMatch(/^uploads\/\d{4}\/\d{2}\/\d{2}\/[0-9a-f-]{36}\.gif$/);
    });

    it("拒绝超过大小上限的文件", async () => {
      const service = createService();
      await expect(
        service.createPresignedUploadUrl({
          contentType: "application/pdf",
          fileSize: MAX_FILE_SIZE_BYTES + 1,
        }),
      ).rejects.toMatchObject({ code: "R2_FILE_TOO_LARGE" });
    });
  });

  describe("确认上传", () => {
    const input = {
      key: VALID_KEY,
      contentType: "image/png" as const,
      fileSize: 1024,
    };

    it("实际对象与声明一致时返回访问信息", async () => {
      const service = createService();
      sendMock.mockResolvedValueOnce({ ContentLength: 1024, ContentType: "image/png" });
      const result = await service.confirmUpload(input);
      expect(result).toEqual({
        key: VALID_KEY,
        url: `https://files.example.com/${VALID_KEY}`,
        contentType: "image/png",
        size: 1024,
      });
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it("实际大小与声明不一致时删除对象并报错", async () => {
      const service = createService();
      sendMock.mockResolvedValueOnce({ ContentLength: 2048, ContentType: "image/png" });
      await expect(service.confirmUpload(input)).rejects.toMatchObject({
        code: "R2_UPLOAD_INVALID",
      });
      expect(sendMock).toHaveBeenCalledTimes(2);
      const cleanup = sentCommand(1) as DeleteObjectCommand;
      expect(cleanup).toBeInstanceOf(DeleteObjectCommand);
      expect(cleanup.input.Key).toBe(VALID_KEY);
    });

    it("实际类型与声明不一致时删除对象并报错", async () => {
      const service = createService();
      sendMock.mockResolvedValueOnce({ ContentLength: 1024, ContentType: "image/gif" });
      await expect(service.confirmUpload(input)).rejects.toMatchObject({
        code: "R2_UPLOAD_INVALID",
      });
      expect(sentCommand(1)).toBeInstanceOf(DeleteObjectCommand);
    });

    it("对象不存在时返回 404，不做删除", async () => {
      const service = createService();
      sendMock.mockRejectedValueOnce(
        new S3ServiceException({
          name: "NotFound",
          $fault: "server",
          $metadata: { httpStatusCode: 404 },
        }),
      );
      await expect(service.confirmUpload(input)).rejects.toMatchObject({
        code: "R2_UPLOAD_NOT_FOUND",
      });
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it("非法 key 直接拒绝，不发起请求", async () => {
      const service = createService();
      await expect(
        service.confirmUpload({ ...input, key: "backups/db.sql" }),
      ).rejects.toMatchObject({ code: "R2_INVALID_OBJECT_KEY" });
      expect(sendMock).not.toHaveBeenCalled();
    });
  });

  describe("公开 URL 拼接", () => {
    it("兼容带与不带尾斜线的基址", () => {
      expect(createService().getPublicUrl(VALID_KEY)).toBe(
        `https://files.example.com/${VALID_KEY}`,
      );
      expect(
        createService({ R2_PUBLIC_BASE_URL: "https://cdn.example.com" }).getPublicUrl(VALID_KEY),
      ).toBe(`https://cdn.example.com/${VALID_KEY}`);
    });
  });
});
