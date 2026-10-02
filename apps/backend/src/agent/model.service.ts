import { createAlibaba } from "@ai-sdk/alibaba";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createAnthropicAws } from "@ai-sdk/anthropic-aws";
import { createAzure } from "@ai-sdk/azure";
import { createBaseten } from "@ai-sdk/baseten";
import { createCerebras } from "@ai-sdk/cerebras";
import { createCohere } from "@ai-sdk/cohere";
import { createDeepInfra } from "@ai-sdk/deepinfra";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createFireworks } from "@ai-sdk/fireworks";
import { createGateway } from "@ai-sdk/gateway";
import { createGmicloud } from "@ai-sdk/gmicloud";
import { createGoogleVertex } from "@ai-sdk/google-vertex";
import { createGroq } from "@ai-sdk/groq";
import { createHuggingFace } from "@ai-sdk/huggingface";
import { createMiniMax } from "@ai-sdk/minimax";
import { createMistral } from "@ai-sdk/mistral";
import { createMoonshotAI } from "@ai-sdk/moonshotai";
import { createOpenResponses } from "@ai-sdk/open-responses";
import { createPerplexity } from "@ai-sdk/perplexity";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createXai } from "@ai-sdk/xai";
import { createZai } from "@ai-sdk/zai";
import type { EmbeddingModel, LanguageModel } from "ai";
import type { EnvConfig } from "../config/env-schema.js";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { extractReasoningMiddleware, generateText, NoSuchModelError, wrapLanguageModel } from "ai";
import { providerSettings } from "./agent.schema.js";
import { AppError } from "../common/app-error.js";
import { ProviderService } from "./provider.service.js";
import { AgentErrorService } from "./error.service.js";

type ResolvedProvider = Awaited<ReturnType<ProviderService["resolve"]>>;

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

  private sdk(provider: ResolvedProvider) {
    const settings = providerSettings.parse(provider.settings);
    const options = {
      apiKey: provider.apiKey,
      ...(provider.base_url && { baseURL: provider.base_url }),
    };
    switch (provider.kind) {
      case "openai":
        return createOpenAI(options);
      case "anthropic":
        return createAnthropic(options);
      case "google":
        return createGoogleGenerativeAI(options);
      case "deepseek":
        return createDeepSeek(options);
      case "qwen":
        return createAlibaba({
          ...options,
          baseURL: provider.base_url ?? "https://dashscope.aliyuncs.com/compatible-mode/v1",
        });
      case "xai":
        return createXai(options);
      case "mistral":
        return createMistral(options);
      case "groq":
        return createGroq(options);
      case "cohere":
        return createCohere(options);
      case "deepinfra":
        return createDeepInfra(options);
      case "togetherai":
        return createTogetherAI(options);
      case "fireworks":
        return createFireworks(options);
      case "cerebras":
        return createCerebras(options);
      case "perplexity":
        return createPerplexity(options);
      case "moonshotai":
        return createMoonshotAI(options);
      case "minimax":
        return createMiniMax(options);
      case "gateway":
        return createGateway(options);
      case "baseten":
        return createBaseten(options);
      case "huggingface":
        return createHuggingFace(options);
      case "gmicloud":
        return createGmicloud(options);
      case "zai":
        return createZai(options);
      case "azure":
        return createAzure({ ...options, resourceName: settings.resourceName });
      case "bedrock":
        return createAmazonBedrock({ ...options, region: settings.region });
      case "anthropic_aws":
        return createAnthropicAws({
          ...options,
          region: settings.region,
          workspaceId: settings.workspaceId,
        });
      case "vertex":
        return createGoogleVertex(options);
      case "glm":
        return createZai({
          ...options,
          baseURL: provider.base_url ?? "https://open.bigmodel.cn/api/paas/v4",
        });
      case "openrouter":
      case "siliconflow":
      case "ollama":
      case "compatible": {
        const baseURL =
          provider.base_url ??
          {
            openrouter: "https://openrouter.ai/api/v1",
            siliconflow: "https://api.siliconflow.cn/v1",
            ollama: "http://localhost:11434/v1",
            compatible: "",
          }[provider.kind];
        if (!baseURL) {
          throw new AppError("AI_PROVIDER_INVALID", "请填写服务地址", HttpStatus.BAD_REQUEST);
        }
        if (provider.kind === "compatible") {
          switch (settings.protocol) {
            case "responses":
              return createOpenAI({ ...options, baseURL });
            case "open-responses":
              return createOpenResponses({
                ...options,
                name: "custom",
                url: `${baseURL.replace(/\/$/, "")}/responses`,
              });
            case "anthropic":
              return createAnthropic({ ...options, baseURL });
            case "google":
              return createGoogleGenerativeAI({ ...options, baseURL });
          }
        }
        return createOpenAICompatible({
          ...options,
          name: provider.kind,
          baseURL,
          includeUsage: true,
        });
      }
    }
  }

  async language(
    userId: string,
    providerId?: string,
  ): Promise<{ model: LanguageModel; provider: ResolvedProvider }> {
    const provider = await this.providers.resolve(userId, providerId);
    const settings = providerSettings.parse(provider.settings);
    // Preserve the Chat Completions protocol of existing OpenAI proxy configurations.
    if (
      provider.kind === "openai" &&
      (settings.protocol === "chat" || (provider.base_url && !settings.protocol))
    ) {
      return {
        provider,
        model: createOpenAI({
          apiKey: provider.apiKey,
          baseURL: provider.base_url ?? undefined,
        }).chat(provider.model),
      };
    }
    const model = this.sdk(provider).languageModel(provider.model);
    return {
      provider,
      model:
        provider.kind === "compatible" ||
        provider.kind === "ollama" ||
        provider.kind === "siliconflow" ||
        provider.kind === "openrouter"
          ? wrapLanguageModel({
              model,
              middleware: extractReasoningMiddleware({ tagName: "think" }),
            })
          : model,
    };
  }

  async embedding(
    userId: string,
    providerId?: string,
  ): Promise<{ model: EmbeddingModel; provider: ResolvedProvider }> {
    const provider = await this.providers.resolve(userId, providerId);
    if (!provider.embedding_model) {
      throw new AppError(
        "EMBEDDING_NOT_CONFIGURED",
        "当前配置未设置嵌入模型",
        HttpStatus.BAD_REQUEST,
      );
    }
    const sdk = this.sdk(provider);
    try {
      return { provider, model: sdk.embeddingModel(provider.embedding_model) };
    } catch (error) {
      if (NoSuchModelError.isInstance(error)) {
        throw new AppError(
          "EMBEDDING_NOT_SUPPORTED",
          "当前厂商不支持此嵌入模型",
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  async test(userId: string, providerId: string) {
    const { model, provider } = await this.language(userId, providerId);
    const started = Date.now();
    try {
      const result = await generateText({
        model,
        prompt: "仅回复“Narraverse 模型连接正常”。",
        maxOutputTokens: 30,
        abortSignal: AbortSignal.timeout(30_000),
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
