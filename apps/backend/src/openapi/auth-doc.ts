import type { OpenAPIObject } from "@nestjs/swagger";

/**
 * Better Auth 的路由由运行时适配器注册，Nest 无法自动扫描，因此在这里补齐核心认证契约。
 * 认证仍完全由 Better Auth 处理，本文件只负责生成文档。
 */
export function appendAuthDocs(document: OpenAPIObject) {
  const jsonBody = (schema: Record<string, unknown>) => ({
    required: true,
    content: { "application/json": { schema } },
  });
  const response = (description: string, schema?: Record<string, unknown>) => ({
    description,
    ...(schema ? { content: { "application/json": { schema } } } : {}),
  });
  const user = {
    type: "object",
    properties: {
      id: { type: "string", description: "Better Auth 用户 ID" },
      name: { type: "string", example: "张三" },
      email: { type: "string", format: "email", example: "writer@example.com" },
      emailVerified: { type: "boolean" },
      image: { type: ["string", "null"], format: "uri" },
    },
  };
  document.paths["/api/auth/sign-up/email"] = {
    post: {
      tags: ["身份认证"],
      summary: "邮箱注册",
      operationId: "authSignUp",
      requestBody: jsonBody({
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1, example: "张三" },
          email: { type: "string", format: "email", example: "writer@example.com" },
          password: { type: "string", format: "password", minLength: 8, maxLength: 128 },
        },
      }),
      responses: {
        200: response("注册成功并写入会话 Cookie", user),
        400: response("参数错误或账号已存在"),
      },
    },
  };
  document.paths["/api/auth/sign-in/email"] = {
    post: {
      tags: ["身份认证"],
      summary: "邮箱登录",
      operationId: "authSignIn",
      requestBody: jsonBody({
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "writer@example.com" },
          password: { type: "string", format: "password", minLength: 8, maxLength: 128 },
          rememberMe: { type: "boolean", default: true },
        },
      }),
      responses: {
        200: {
          ...response("登录成功并写入会话 Cookie", user),
          headers: {
            "set-auth-token": {
              description: "供 SDK 或其他 Agent 使用的 Bearer 会话令牌",
              schema: { type: "string" },
            },
          },
        },
        401: response("邮箱或密码错误"),
      },
    },
  };
  document.paths["/api/auth/get-session"] = {
    get: {
      tags: ["身份认证"],
      summary: "获取当前会话",
      operationId: "authGetSession",
      security: [{ "better-auth": [] }],
      responses: {
        200: response("当前会话；未登录时返回 null", {
          type: ["object", "null"],
          additionalProperties: true,
        }),
      },
    },
  };
  document.paths["/api/auth/sign-out"] = {
    post: {
      tags: ["身份认证"],
      summary: "退出登录",
      operationId: "authSignOut",
      security: [{ "better-auth": [] }],
      responses: {
        200: response("退出成功并清理会话 Cookie"),
        401: response("未登录或会话已失效"),
      },
    },
  };
  return document;
}
