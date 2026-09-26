import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import { DEV_USER } from "./dev-fixtures.js";

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
    // 联调期临时方案：开发环境统一写死联调用户，浏览器登录态不影响（上线前移除）
    if (process.env.NODE_ENV !== "production") {
      const devUserId = process.env.AI_DEV_USER_ID;
      if (devUserId) return { id: devUserId, email: DEV_USER.email, name: DEV_USER.name };
    }
    if (!user) {
      // 联调期临时方案：免鉴权路由未登录时回退到写死的开发用户
      if (process.env.NODE_ENV !== "production") return DEV_USER;
      throw new Error("CurrentUser 只能用于已认证路由");
    }
    return user;
  },
);
