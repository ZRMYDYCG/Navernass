import type { EmbeddingModel, LanguageModel } from "ai";
import type { EnvConfig } from "../config/env-schema.js";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { extractReasoningMiddleware, generateText, wrapLanguageModel } from "ai";
import { AppError } from "../common/app-error.js";
import { ProviderService } from "./provider.service.js";
import { AgentErrorService } from "./error.service.js";

const compatibleBaseUrls = {
  deepseek: "https://api.deepseek.com",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  glm: "https://open.bigmodel.cn/api/paas/v4",
} as const;

@Injectable()
export class ModelService {
  private readonly maxRetries: number;

  constructor(
    @Inject(ConfigService) config: ConfigService<EnvConfig, true>,
    @Inject(ProviderService) private readonly providers: ProviderService,
    @Inject(AgentErrorService) private readonly errors: AgentErrorService,
  ) {
    this.maxRetries = config.get("AGENT_MAX_RETRIES", { infer: true });
  }

  async language(
    userId: string,
    providerId?: string,
  ): Promise<{
    model: LanguageModel;
    provider: Awaited<ReturnType<ProviderService["resolve"]>>;
  }> {
    const provider = await this.providers.resolve(userId, providerId);
    const options = {
      apiKey: provider.apiKey,
      ...(provider.base_url && { baseURL: provider.base_url }),
    };
    switch (provider.kind) {
      case "openai":
        return { provider, model: createOpenAI(options)(provider.model) };
      case "anthropic":
        return { provider, model: createAnthropic(options)(provider.model) };
      case "google":
        return { provider, model: createGoogleGenerativeAI(options)(provider.model) };
      default: {
        const baseURL =
          provider.base_url ?? compatibleBaseUrls[provider.kind as keyof typeof compatibleBaseUrls];
        if (!baseURL) {
          throw new AppError(
            "AI_PROVIDER_INVALID",
            "兼容 Provider 必须配置 baseUrl",
            HttpStatus.BAD_REQUEST,
          );
        }
        const compatible = createOpenAICompatible({
          name: provider.kind,
          apiKey: provider.apiKey,
          baseURL,
          includeUsage: true,
        });
        // MiniMax 等模型把推理以 <think> 标签混在正文里输出，拆成独立的 reasoning 片段。
        const model = wrapLanguageModel({
          model: compatible(provider.model),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        });
        return { provider, model };
      }
    }
  }

  async embedding(
    userId: string,
    providerId?: string,
  ): Promise<{
    model: EmbeddingModel;
    provider: Awaited<ReturnType<ProviderService["resolve"]>>;
  }> {
    const provider = await this.providers.resolve(userId, providerId);
    if (!provider.embedding_model) {
      throw new AppError(
        "EMBEDDING_NOT_CONFIGURED",
        "当前 Provider 未配置 embeddingModel",
        HttpStatus.BAD_REQUEST,
      );
    }
    const options = {
      apiKey: provider.apiKey,
      ...(provider.base_url && { baseURL: provider.base_url }),
    };
    if (provider.kind === "openai") {
      return { provider, model: createOpenAI(options).embeddingModel(provider.embedding_model) };
    }
    if (provider.kind === "google") {
      return {
        provider,
        model: createGoogleGenerativeAI(options).embeddingModel(provider.embedding_model),
      };
    }
    if (provider.kind === "anthropic") {
      throw new AppError(
        "EMBEDDING_NOT_SUPPORTED",
        "Anthropic 不提供嵌入模型，请选择 OpenAI 或兼容 Provider",
        HttpStatus.BAD_REQUEST,
      );
    }
    const baseURL =
      provider.base_url ?? compatibleBaseUrls[provider.kind as keyof typeof compatibleBaseUrls];
    if (!baseURL) {
      throw new AppError(
        "AI_PROVIDER_INVALID",
        "兼容 Provider 必须配置 baseUrl",
        HttpStatus.BAD_REQUEST,
      );
    }
    const compatible = createOpenAICompatible({
      name: provider.kind,
      apiKey: provider.apiKey,
      baseURL,
    });
    return { provider, model: compatible.embeddingModel(provider.embedding_model) };
  }

  async test(userId: string, providerId: string) {
    const { model, provider } = await this.language(userId, providerId);
    const started = Date.now();
    try {
      const result = await generateText({
        model,
        prompt: "仅回复“Narraverse 模型连接正常”。",
        maxOutputTokens: 30,
        temperature: 0,
        maxRetries: this.maxRetries,
      });
      return {
        providerId: provider.id,
        model: provider.model,
        response: result.text,
        usage: result.totalUsage,
        latencyMs: Date.now() - started,
      };
    } catch (error) {
      throw this.errors.toAppError(error);
    }
  }
}
