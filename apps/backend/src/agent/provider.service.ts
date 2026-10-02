import type { Prisma } from "../generated/prisma/client.js";
import { providerSettings, type CreateProvider, type UpdateProvider } from "./agent.schema.js";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";
import { SecretService } from "./secret.service.js";

@Injectable()
export class ProviderService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(SecretService) private readonly secrets: SecretService,
  ) {}

  list(userId: string) {
    return this.prisma.aiProviderConfig.findMany({
      where: { user_id: userId },
      orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
      select: this.publicFields(),
    });
  }

  async create(userId: string, input: CreateProvider) {
    this.validate(input.kind, input.baseUrl, input.settings);
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
    const current = await this.getOwned(userId, id);
    this.validate(
      input.kind ?? current.kind,
      input.baseUrl === undefined ? current.base_url : input.baseUrl,
      input.settings ?? current.settings,
    );
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
    await this.prisma.$transaction(async (tx) => {
      await tx.agentSession.deleteMany({ where: { provider_id: id, user_id: userId } });
      await tx.agentRun.deleteMany({ where: { provider_id: id, user_id: userId } });
      await tx.aiProviderConfig.delete({ where: { id } });
    });
  }

  async credentials(userId: string, id: string) {
    const provider = await this.getOwned(userId, id);
    return { ...provider, apiKey: this.secrets.decrypt(provider.api_key_cipher) };
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
    if (!provider) {
      throw new AppError(
        "AI_PROVIDER_NOT_FOUND",
        "未找到可用模型配置，请先配置 Provider",
        HttpStatus.NOT_FOUND,
      );
    }
    return { ...provider, apiKey: this.secrets.decrypt(provider.api_key_cipher) };
  }

  private validate(
    kind: CreateProvider["kind"],
    baseUrl: string | null | undefined,
    value: unknown,
  ) {
    const settings = providerSettings.parse(value);
    if (
      (kind === "compatible" && !baseUrl) ||
      (kind === "azure" && !baseUrl && !settings.resourceName) ||
      ((kind === "bedrock" || kind === "anthropic_aws") && !settings.region) ||
      (kind === "anthropic_aws" && !settings.workspaceId)
    ) {
      throw new AppError(
        "AI_PROVIDER_INVALID",
        "请补全厂商所需的服务地址、资源名称或区域配置",
        HttpStatus.BAD_REQUEST,
      );
    }
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
