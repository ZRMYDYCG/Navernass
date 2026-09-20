import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import type { Observable } from "rxjs";
import type { AuthRequest } from "./current-user.js";
import { Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map } from "rxjs";
import { ApiResult } from "./api-result.js";
import { RAW_RESPONSE_KEY } from "./raw-response.js";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (
      this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    ) {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return next.handle().pipe(
      map((value: unknown) => {
        if (value === undefined || value === null) return value;
        if (isEnvelope(value)) return value;
        const result = value instanceof ApiResult ? value : new ApiResult(value);
        return {
          success: true,
          data: result.data,
          ...(result.meta && { meta: result.meta }),
          requestId: request.requestId,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

function isEnvelope(value: unknown): value is { success: boolean } {
  return typeof value === "object" && value !== null && "success" in value;
}
