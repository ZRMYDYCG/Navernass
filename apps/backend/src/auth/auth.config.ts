import type { ConfigService } from "@nestjs/config";
import type { EnvConfig } from "../config/env-schema.js";
import type { PrismaService } from "../database/prisma.service.js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { bearer } from "better-auth/plugins";
import { z } from "zod";

// better-auth 的 /update-user 不校验字段，客户端可提交的资料在这里收口。
const userUpdate = z.object({
  name: z.string().trim().min(1).max(64).optional(),
  image: z
    .url({ protocol: /^https?$/ })
    .max(2_000)
    .nullable()
    .optional(),
});

export function createAuth(prisma: PrismaService, config: ConfigService<EnvConfig, true>) {
  const adminEmail = config.get("SUPER_ADMIN_EMAIL", { infer: true })?.toLowerCase();
  const trustedOrigins = [
    config.get("APP_URL", { infer: true }),
    ...config
      .get("CORS_ORIGINS", { infer: true })
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ];
  return betterAuth({
    baseURL: config.get("BETTER_AUTH_URL", { infer: true }),
    basePath: "/api/auth",
    secret: config.get("BETTER_AUTH_SECRET", { infer: true }),
    trustedOrigins: Array.from(new Set(trustedOrigins)),
    plugins: [bearer()],
    database: prismaAdapter(prisma, { provider: "mysql" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 60 * 5 },
    },
    advanced: {
      database: { joins: true },
      useSecureCookies: config.get("NODE_ENV", { infer: true }) === "production",
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const protectedAdmin = Boolean(adminEmail && user.email.toLowerCase() === adminEmail);
            await prisma.profile.upsert({
              where: { id: user.id },
              create: {
                id: user.id,
                full_name: user.name,
                avatar_url: user.image,
                role: protectedAdmin ? "super_admin" : "user",
                is_protected: protectedAdmin,
              },
              update: {},
            });
          },
        },
        update: {
          before: async (data) => {
            if (!userUpdate.safeParse({ name: data.name, image: data.image }).success) {
              throw new APIError("BAD_REQUEST", { message: "用户资料格式不正确" });
            }
          },
          after: async (user) => {
            await prisma.profile.upsert({
              where: { id: user.id },
              create: { id: user.id, full_name: user.name, avatar_url: user.image },
              update: { full_name: user.name, avatar_url: user.image },
            });
          },
        },
      },
    },
  });
}

export type AppAuth = ReturnType<typeof createAuth>;
