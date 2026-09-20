import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  session?: unknown;
  requestId?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const nested = (request.session as { user?: AuthUser } | undefined)?.user;
    const user = request.user ?? nested;
    if (!user) throw new Error("CurrentUser 只能用于已认证路由");
    return user;
  },
);
