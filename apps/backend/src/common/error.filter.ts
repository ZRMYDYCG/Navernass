import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { PinoLogger } from "nestjs-pino";
import { AppError } from "./app-error.js";
import type { AuthRequest } from "./current-user.js";

@Catch()
export class ErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<AuthRequest>();
    const response = context.getResponse<Response>();
    const normalized = normalizeError(exception);

    if (normalized.status >= 500) {
      this.logger.error({ err: exception, requestId: request.requestId }, normalized.message);
    } else {
      this.logger.warn({ code: normalized.code, requestId: request.requestId }, normalized.message);
    }

    const retryAfterMs = retryDelay(normalized.details);
    if (retryAfterMs !== undefined) {
      response.setHeader("Retry-After", String(Math.max(1, Math.ceil(retryAfterMs / 1_000))));
    }

    response.status(normalized.status).json({
      success: false,
      error: {
        code: normalized.code,
        message: normalized.message,
        ...(normalized.details !== undefined && { details: normalized.details }),
      },
      requestId: request.requestId,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }
}

function normalizeError(exception: unknown) {
  if (exception instanceof AppError) {
    return {
      status: exception.status,
      code: exception.code,
      message: exception.message,
      details: exception.details,
    };
  }

  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    if (exception.code === "P2002") {
      return {
        status: 409,
        code: "CONFLICT",
        message: "数据已存在",
        details: safeMeta(exception.meta),
      };
    }
    if (exception.code === "P2025") {
      return { status: 404, code: "NOT_FOUND", message: "数据不存在" };
    }
    if (exception.code === "P2003") {
      return { status: 409, code: "CONFLICT", message: "数据仍被其他记录引用" };
    }
    return { status: 500, code: "DATABASE_ERROR", message: "数据库操作失败" };
  }

  if (exception instanceof HttpException) {
    const body = exception.getResponse();
    const message =
      typeof body === "string"
        ? body
        : Array.isArray((body as { message?: unknown }).message)
          ? (body as { message: string[] }).message.join("；")
          : String((body as { message?: unknown }).message ?? exception.message);
    return { status: exception.getStatus(), code: httpCode(exception.getStatus()), message };
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: "INTERNAL_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "服务器内部错误"
        : String((exception as Error)?.message ?? exception),
  };
}

function httpCode(status: number) {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 429) return "RATE_LIMITED";
  return status >= 500 ? "INTERNAL_ERROR" : "HTTP_ERROR";
}

function safeMeta(meta: unknown) {
  if (!meta || typeof meta !== "object") return undefined;
  const target = (meta as { target?: unknown }).target;
  return target ? { target } : undefined;
}

function retryDelay(details: unknown) {
  if (!details || typeof details !== "object" || !("retryAfterMs" in details)) return undefined;
  const value = Number((details as { retryAfterMs?: unknown }).retryAfterMs);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}
