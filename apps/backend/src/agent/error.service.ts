import type { ErrorCodeName } from "../common/error-codes.js";
import { HttpStatus, Injectable } from "@nestjs/common";
import { APICallError, InvalidToolInputError, NoSuchToolError, RetryError } from "ai";
import { AppError } from "../common/app-error.js";
import { Prisma } from "../generated/prisma/client.js";

export interface AgentFailureInfo {
  code: ErrorCodeName;
  message: string;
  status: number;
  retryable: boolean;
  retryAfterMs?: number;
  providerStatus?: number;
  retryCount: number;
  causeName: string;
}

@Injectable()
export class AgentErrorService {
  classify(error: unknown): AgentFailureInfo {
    if (RetryError.isInstance(error)) {
      const nested = this.classify(error.lastError);
      return {
        ...nested,
        retryable: false,
        retryCount: Math.max(nested.retryCount, error.errors.length - 1),
        causeName: error.name,
      };
    }

    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.message,
        status: error.status,
        retryable: error.status === 429 || error.status >= 500,
        retryCount: 0,
        causeName: error.name,
      };
    }

    if (APICallError.isInstance(error)) {
      const status = error.statusCode;
      if (status === 401 || status === 403) {
        return this.info(
          "AI_PROVIDER_AUTH_FAILED",
          "模型 Provider 鉴权失败，请检查 API Key 和访问权限",
          HttpStatus.BAD_GATEWAY,
          false,
          error,
        );
      }
      if (status === 429) {
        return {
          ...this.info(
            "AI_PROVIDER_RATE_LIMITED",
            "模型 Provider 请求过于频繁，请稍后重试",
            HttpStatus.TOO_MANY_REQUESTS,
            true,
            error,
          ),
          retryAfterMs: parseRetryAfter(error.responseHeaders),
          providerStatus: status,
        };
      }
      if (error.isRetryable || (status !== undefined && status >= 500)) {
        return {
          ...this.info(
            "AI_PROVIDER_UNAVAILABLE",
            "模型 Provider 暂时不可用，已完成自动重试",
            HttpStatus.SERVICE_UNAVAILABLE,
            true,
            error,
          ),
          retryAfterMs: parseRetryAfter(error.responseHeaders),
          providerStatus: status,
        };
      }
      return {
        ...this.info(
          "AGENT_EXECUTION_FAILED",
          "模型 Provider 拒绝了本次请求，请检查模型配置与请求参数",
          HttpStatus.BAD_GATEWAY,
          false,
          error,
        ),
        providerStatus: status,
      };
    }

    if (InvalidToolInputError.isInstance(error) || NoSuchToolError.isInstance(error)) {
      return this.info(
        "AGENT_TOOL_INVALID",
        "模型生成了无效的工具调用参数",
        HttpStatus.BAD_REQUEST,
        false,
        error,
      );
    }

    if (isAbortError(error)) {
      const timeout = error instanceof Error && error.name === "TimeoutError";
      return this.info(
        timeout ? "AGENT_TIMEOUT" : "AGENT_ABORTED",
        timeout ? "Agent 执行超时" : "Agent 执行已取消",
        HttpStatus.REQUEST_TIMEOUT,
        false,
        error,
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const retryable = ["P1001", "P1002", "P1008", "P1017", "P2034"].includes(error.code);
      return this.info(
        retryable ? "DATABASE_ERROR" : "AGENT_EXECUTION_FAILED",
        retryable ? "数据库暂时不可用" : "Agent 数据操作失败",
        retryable ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.INTERNAL_SERVER_ERROR,
        retryable,
        error,
      );
    }

    if (isTransientNetworkError(error)) {
      return this.info(
        "AI_PROVIDER_UNAVAILABLE",
        "上游网络暂时不可用，已完成自动重试",
        HttpStatus.SERVICE_UNAVAILABLE,
        true,
        error,
      );
    }

    return this.info(
      "AGENT_EXECUTION_FAILED",
      process.env.NODE_ENV === "production"
        ? "Agent 执行失败，请稍后重试"
        : error instanceof Error
          ? error.message
          : String(error),
      HttpStatus.INTERNAL_SERVER_ERROR,
      false,
      error,
    );
  }

  toAppError(error: unknown, observedRetryCount = 0) {
    if (error instanceof AppError && observedRetryCount === 0) return error;
    const failure = this.classify(error);
    const retryCount = Math.max(failure.retryCount, observedRetryCount);
    return new AppError(failure.code, failure.message, failure.status, {
      retryable: failure.retryable,
      retryCount,
      ...(failure.retryAfterMs !== undefined && { retryAfterMs: failure.retryAfterMs }),
      ...(failure.providerStatus !== undefined && { providerStatus: failure.providerStatus }),
      cause: failure.causeName,
      ...(error instanceof AppError && error.details !== undefined
        ? { originalDetails: error.details }
        : {}),
    });
  }

  private info(
    code: ErrorCodeName,
    message: string,
    status: number,
    retryable: boolean,
    error: unknown,
  ): AgentFailureInfo {
    return {
      code,
      message,
      status,
      retryable,
      retryCount: 0,
      causeName: error instanceof Error ? error.name : "UnknownError",
    };
  }
}

function parseRetryAfter(headers?: Record<string, string>) {
  if (!headers) return undefined;
  const milliseconds = Number(headers["retry-after-ms"]);
  if (Number.isFinite(milliseconds) && milliseconds >= 0) return milliseconds;
  const value = headers["retry-after"];
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;
  const dateDelay = Date.parse(value) - Date.now();
  return Number.isFinite(dateDelay) && dateDelay >= 0 ? dateDelay : undefined;
}

function isAbortError(error: unknown) {
  return (
    error instanceof Error && ["AbortError", "TimeoutError", "AI_AbortError"].includes(error.name)
  );
}

function isTransientNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as Error & { code?: string }).code;
  if (["ECONNRESET", "ECONNREFUSED", "EPIPE", "ETIMEDOUT", "ENETUNREACH"].includes(code ?? "")) {
    return true;
  }
  return "cause" in error && error.cause !== error && isTransientNetworkError(error.cause);
}
