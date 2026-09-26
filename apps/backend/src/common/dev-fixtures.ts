import type { EnvConfig } from "../config/env-schema.js";
import type { PrismaService } from "../database/prisma.service.js";
import type { ConfigService } from "@nestjs/config";
import type { SecretService } from "../agent/secret.service.js";

// 联调期临时写死的开发环境固件：Agent 模块免鉴权时统一回退到这套数据，
// 上线前需删除（main.ts 的 ensureDevFixtures、CurrentUser 回退、ProviderService 兜底）。
export const DEV_USER_ID = "5ef1c2a9-7b3e-4d8a-9c21-6f0a55d1e001";
export const DEV_NOVEL_ID = "5ef1c2a9-7b3e-4d8a-9c21-6f0a55d1e002";
export const DEV_PROVIDER_NAME = "dev";

export const DEV_USER = {
  id: DEV_USER_ID,
  email: "dev@narraverse.local",
  name: "Dev User",
};

export async function ensureDevFixtures(
  prisma: PrismaService,
  config: ConfigService<EnvConfig, true>,
  secrets: SecretService,
) {
  await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    create: { id: DEV_USER_ID, name: DEV_USER.name, email: DEV_USER.email },
    update: {},
  });
  await prisma.profile.upsert({
    where: { id: DEV_USER_ID },
    create: { id: DEV_USER_ID, full_name: DEV_USER.name },
    update: {},
  });
  await prisma.novel.upsert({
    where: { id: DEV_NOVEL_ID },
    create: {
      id: DEV_NOVEL_ID,
      user_id: DEV_USER_ID,
      title: "联调测试小说",
      tags: [],
      characters: [],
      relationships: [],
    },
    update: {},
  });

  const baseUrl = config.get("AI_DEV_BASE_URL", { infer: true });
  const apiKey = config.get("AI_DEV_API_KEY", { infer: true });
  const model = config.get("AI_DEV_MODEL", { infer: true });
  if (!baseUrl || !apiKey || !model) return;
  await prisma.aiProviderConfig.upsert({
    where: { user_id_name: { user_id: DEV_USER_ID, name: DEV_PROVIDER_NAME } },
    create: {
      user_id: DEV_USER_ID,
      name: DEV_PROVIDER_NAME,
      kind: "compatible",
      base_url: baseUrl,
      api_key_cipher: secrets.encrypt(apiKey),
      model,
      settings: {},
      is_default: true,
      is_enabled: true,
    },
    update: {
      base_url: baseUrl,
      api_key_cipher: secrets.encrypt(apiKey),
      model,
      is_default: true,
      is_enabled: true,
    },
  });
}
