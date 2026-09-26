import type { Prisma } from "../generated/prisma/client.js";
import type { EnvConfig } from "../config/env-schema.js";
import type { CreateProvider, UpdateProvider } from "./agent.schema.js";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppError } from "../common/app-error.js";
import { DEV_USER_ID, DEV_PROVIDER_NAME } from "../common/dev-fixtures.js";
import { PrismaService } from "../database/prisma.service.js";
import { SecretService } from "./secret.service.js";

@Injectable()
export class ProviderService {
  private readonly devFallbackEnabled: boolean;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(SecretService) private readonly secrets: SecretService,
    @Inject(ConfigService) config: ConfigService<EnvConfig, true>,
  ) {
    this.devFallbackEnabled =
      config.get("NODE_ENV", { infer: true }) === "development" &&
      Boolean(config.get("AI_DEV_API_KEY", { infer: true }));
  }

  list(userId: string) {
    return this.prisma.aiProviderConfig.findMany({
      where: { user_id: userId },
      orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
      select: this.publicFields(),
    });
  }

  async create(userId: string, input: CreateProvider) {
    return this.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.aiProviderConfig.updateMany({
          where: { user_id: userId },
          data: { is_default: false },
        });
      }
      return tx.aiProviderConfig.create({
        data: {
          user_id: userId,
          name: input.name,
          kind: input.kind,
          base_url: input.baseUrl,
          api_key_cipher: this.secrets.encrypt(input.apiKey),
          model: input.model,
          embedding_model: input.embeddingModel,
          supports_tools: input.supportsTools,
          supports_structured: input.supportsStructured,
          is_default: input.isDefault,
          settings: input.settings as Prisma.InputJsonValue,
        },
        select: this.publicFields(),
      });
    });
  }

  async update(userId: string, id: string, input: UpdateProvider) {
    await this.getOwned(userId, id);
    return this.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.aiProviderConfig.updateMany({
          where: { user_id: userId },
          data: { is_default: false },
        });
      }
      return tx.aiProviderConfig.update({
        where: { id },
        data: {
          name: input.name,
          kind: input.kind,
          base_url: input.baseUrl,
          ...(input.apiKey && { api_key_cipher: this.secrets.encrypt(input.apiKey) }),
          model: input.model,
          embedding_model: input.embeddingModel,
          supports_tools: input.supportsTools,
          supports_structured: input.supportsStructured,
          is_default: input.isDefault,
          is_enabled: input.isEnabled,
          ...(input.settings && { settings: input.settings as Prisma.InputJsonValue }),
        },
        select: this.publicFields(),
      });
    });
  }

  async remove(userId: string, id: string) {
    await this.getOwned(userId, id);
    const used = await this.prisma.agentRun.count({ where: { provider_id: id } });
    if (used) {
      throw new AppError(
        "CONFLICT",
        "该模型配置已有执行记录，请停用而不是删除",
        HttpStatus.CONFLICT,
      );
    }
    await this.prisma.aiProviderConfig.delete({ where: { id } });
  }

  async resolve(userId: string, id?: string) {
    const provider =
      (await this.prisma.aiProviderConfig.findFirst({
        where: id
          ? { id, user_id: userId, is_enabled: true }
          : { user_id: userId, is_enabled: true, is_default: true },
      })) ??
      (!id
        ? await this.prisma.aiProviderConfig.findFirst({
            where: { user_id: userId, is_enabled: true },
            orderBy: { created_at: "asc" },
          })
        : null);
    if (!provider) return this.resolveDevProvider();
    return { ...provider, apiKey: this.secrets.decrypt(provider.api_key_cipher) };
  }

  // 联调期临时方案：没有可用配置时兜底到写死的开发 Provider
  private async resolveDevProvider() {
    if (this.devFallbackEnabled) {
      const dev = await this.prisma.aiProviderConfig.findFirst({
        where: { user_id: DEV_USER_ID, name: DEV_PROVIDER_NAME, is_enabled: true },
      });
      if (dev) return { ...dev, apiKey: this.secrets.decrypt(dev.api_key_cipher) };
    }
    throw new AppError(
      "AI_PROVIDER_NOT_FOUND",
      "未找到可用模型配置，请先配置 Provider",
      HttpStatus.NOT_FOUND,
    );
  }

  private async getOwned(userId: string, id: string) {
    const provider = await this.prisma.aiProviderConfig.findFirst({
      where: { id, user_id: userId },
    });
    if (!provider) throw AppError.notFound("AI_PROVIDER_NOT_FOUND", "模型配置");
    return provider;
  }

  private publicFields() {
    return {
      id: true,
      name: true,
      kind: true,
      base_url: true,
      model: true,
      embedding_model: true,
      supports_tools: true,
      supports_structured: true,
      is_default: true,
      is_enabled: true,
      settings: true,
      created_at: true,
      updated_at: true,
    } as const;
  }
}
