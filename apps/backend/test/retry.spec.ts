import type { ConfigService } from "@nestjs/config";
import type { EnvConfig } from "../src/config/env-schema.js";
import { APICallError } from "ai";
import { describe, expect, it, vi } from "vitest";
import { AppError } from "../src/common/app-error.js";
import { AgentErrorService } from "../src/agent/error.service.js";
import { RetryService } from "../src/agent/retry.service.js";

function createRetryService() {
  const values = {
    AGENT_MAX_RETRIES: 2,
    AGENT_RETRY_BASE_MS: 1,
    AGENT_RETRY_MAX_MS: 10,
  };
  const config = {
    get: (key: keyof typeof values) => values[key],
  } as unknown as ConfigService<EnvConfig, true>;
  const errors = new AgentErrorService();
  return { errors, retries: new RetryService(config, errors) };
}

function providerError(statusCode: number, isRetryable: boolean) {
  return new APICallError({
    message: "provider failed",
    url: "https://provider.example/v1/chat",
    requestBodyValues: {},
    statusCode,
    responseHeaders: { "retry-after-ms": "0" },
    isRetryable,
  });
}

describe("Agent 错误与重试", () => {
  it("只对可重试 Provider 错误执行有限次数重试", async () => {
    const { retries } = createRetryService();
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(providerError(503, true))
      .mockRejectedValueOnce(providerError(503, true))
      .mockResolvedValue("ok");
    const events: number[] = [];

    const result = await retries.execute(operation, {
      onRetry: (event) => {
        events.push(event.attempt);
      },
    });

    expect(result).toBe("ok");
    expect(operation).toHaveBeenCalledTimes(3);
    expect(events).toEqual([2, 3]);
  });

  it("鉴权和业务校验错误不会重试", async () => {
    const { errors, retries } = createRetryService();
    const operation = vi.fn().mockRejectedValue(providerError(401, false));

    await expect(retries.execute(operation)).rejects.toBeInstanceOf(APICallError);
    expect(operation).toHaveBeenCalledTimes(1);
    expect(errors.toAppError(providerError(401, false))).toMatchObject({
      code: "AI_PROVIDER_AUTH_FAILED",
      status: 502,
    });

    const business = vi
      .fn()
      .mockRejectedValue(new AppError("CHAPTER_NOT_FOUND", "章节不存在", 404));
    await expect(retries.execute(business)).rejects.toMatchObject({ code: "CHAPTER_NOT_FOUND" });
    expect(business).toHaveBeenCalledTimes(1);
  });

  it("错误响应包含安全的重试元数据", () => {
    const { errors } = createRetryService();
    const normalized = errors.toAppError(providerError(429, true), 2);

    expect(normalized).toMatchObject({
      code: "AI_PROVIDER_RATE_LIMITED",
      status: 429,
      details: {
        retryable: true,
        retryCount: 2,
        retryAfterMs: 0,
        providerStatus: 429,
      },
    });
    expect(JSON.stringify(normalized.details)).not.toContain("requestBodyValues");
  });
});
