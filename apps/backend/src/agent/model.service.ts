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
import { z } from "zod";
import type { EnvConfig } from "../config/env-schema.js";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  defaultSettingsMiddleware,
  extractReasoningMiddleware,
  generateText,
  NoSuchModelError,
  wrapLanguageModel,
} from "ai";
import { providerSettings, type DiscoverModels } from "./agent.schema.js";
import { AppError } from "../common/app-error.js";
import { ProviderService } from "./provider.service.js";
import { AgentErrorService } from "./error.service.js";
import { CatalogService } from "./catalog.service.js";

type ResolvedProvider = Awaited<ReturnType<ProviderService["resolve"]>>;

const remoteModels = z.object({
  data: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        display_name: z.string().optional(),
      }),
    )
    .optional(),
  models: z
    .array(
      z.object({
        name: z.string(),
        displayName: z.string().optional(),
        supportedGenerationMethods: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  has_more: z.boolean().optional(),
  last_id: z.string().optional(),
  nextPageToken: z.string().optional(),
});

@Injectable()
export class ModelService {
  async discover(userId: string, input: DiscoverModels) {
    const saved = input.providerId
      ? await this.providers.credentials(userId, input.providerId)
      : undefined;
    const apiKey = input.apiKey ?? saved?.apiKey;
    if (!apiKey && input.kind !== "ollama")
      throw new AppError("AI_PROVIDER_INVALID", "请先填写 API Key", HttpStatus.BAD_REQUEST);
    const entry = await this.catalog.provider(input.kind);
    const baseURL = input.baseUrl ?? saved?.base_url ?? (entry && this.catalog.modelsUrl(entry));
    if (!entry || !baseURL)
      throw new AppError(
        "AI_PROVIDER_INVALID",
        "此厂商暂不支持账号模型查询，请使用公开目录或手动输入",
        HttpStatus.BAD_REQUEST,
      );
    const protocol =
      input.kind === "compatible"
        ? input.protocol
        : entry.npm === "@ai-sdk/anthropic"
          ? "anthropic"
          : entry.npm === "@ai-sdk/google"
            ? "google"
            : "chat";
    const headers: Record<string, string> =
      protocol === "anthropic"
        ? { "x-api-key": apiKey ?? "", "anthropic-version": "2023-06-01" }
        : protocol === "google"
          ? { "x-goog-api-key": apiKey ?? "" }
          : { Authorization: `Bearer ${apiKey ?? "ollama"}` };
    const models: { id: string; name: string }[] = [];
    let page: string | undefined;
    do {
      const url = new URL(`${baseURL.replace(/\/$/, "")}/models`);
      if (page) url.searchParams.set(protocol === "google" ? "pageToken" : "after_id", page);
      if (protocol === "anthropic") url.searchParams.set("limit", "1000");
      let response: Response;
      try {
        response = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(10_000),
          redirect: "error",
        });
      } catch {
        throw new AppError(
          "AI_PROVIDER_UNAVAILABLE",
          "无法连接模型列表接口，请检查服务地址",
          HttpStatus.BAD_GATEWAY,
        );
      }
      if (!response.ok)
        throw new AppError(
          "AI_PROVIDER_UNAVAILABLE",
          `模型列表请求失败（HTTP ${response.status}），请检查密钥或使用公开目录`,
          HttpStatus.BAD_GATEWAY,
        );
      const result = remoteModels.safeParse(await response.json());
      if (!result.success || (!result.data.data && !result.data.models))
        throw new AppError(
          "AI_PROVIDER_UNAVAILABLE",
          "服务未返回支持的模型列表格式",
          HttpStatus.BAD_GATEWAY,
        );
      for (const model of result.data.data ?? [])
        models.push({ id: model.id, name: model.display_name ?? model.name ?? model.id });
      for (const model of result.data.models ?? []) {
        if (model.supportedGenerationMethods?.includes("generateContent"))
          models.push({
            id: model.name.replace(/^models\//, ""),
            name: model.displayName ?? model.name,
          });
      }
      const next =
        result.data.nextPageToken ?? (result.data.has_more ? result.data.last_id : undefined);
      if (next === page) break;
      page = next;
    } while (page);
    return [...new Map(models.map((model) => [model.id, model])).values()];
  }

  private readonly maxRetries: number;

  constructor(
    @Inject(ConfigService) config: ConfigService<EnvConfig, true>,
    @Inject(ProviderService) private readonly providers: ProviderService,
    @Inject(AgentErrorService) private readonly errors: AgentErrorService,
    @Inject(CatalogService) private readonly catalog: CatalogService,
  ) {
    this.maxRetries = config.get("AGENT_MAX_RETRIES", { infer: true });
  }

  /**
   * 按目录中的 SDK 包选择 AI SDK 适配器；`options` 是该适配器读取 providerOptions 的命名空间。
   * 已安装原生包的厂商优先走原生适配器，其余走 OpenAI 兼容协议。
   */
  private async sdk(provider: ResolvedProvider) {
    const settings = providerSettings.parse(provider.settings);
    const entry = await this.catalog.provider(provider.kind);
    if (!entry) {
      throw new AppError(
        "AI_PROVIDER_INVALID",
        "该模型厂商已不在目录中，请重新配置",
        HttpStatus.BAD_REQUEST,
      );
    }
    const own = {
      apiKey: provider.apiKey,
      ...(provider.base_url && { baseURL: provider.base_url }),
    };
    const baseURL = provider.base_url ?? entry.api;
    const options = { apiKey: provider.apiKey, ...(baseURL && { baseURL }) };
    switch (provider.kind) {
      case "deepseek":
        return { sdk: createDeepSeek(own), options: "deepseek" };
      case "alibaba-cn":
        return { sdk: createAlibaba(options), options: "alibaba" };
      case "moonshotai":
        return { sdk: createMoonshotAI(own), options: "moonshotai" };
      case "zai":
        return { sdk: createZai(own), options: "zai" };
      case "zhipuai":
        return { sdk: createZai(options), options: "zai" };
      case "fireworks-ai":
        return { sdk: createFireworks(own), options: "fireworks" };
      case "minimax":
        return { sdk: createMiniMax(own), options: "minimax" };
      case "baseten":
        return { sdk: createBaseten(own), options: "baseten" };
      case "huggingface":
        return { sdk: createHuggingFace(own), options: "huggingface" };
      case "gmicloud":
        return { sdk: createGmicloud(own), options: "gmicloud" };
      case "anthropic_aws":
        return {
          sdk: createAnthropicAws({
            ...own,
            region: settings.region,
            workspaceId: settings.workspaceId,
          }),
          options: "anthropic",
        };
      case "compatible":
        if (!baseURL) {
          throw new AppError("AI_PROVIDER_INVALID", "请填写服务地址", HttpStatus.BAD_REQUEST);
        }
        switch (settings.protocol) {
          case "responses":
            return { sdk: createOpenAI({ ...options, baseURL }), options: "openai" };
          case "open-responses":
            return {
              sdk: createOpenResponses({
                ...options,
                name: "custom",
                url: `${baseURL.replace(/\/$/, "")}/responses`,
              }),
              options: "custom",
            };
          case "anthropic":
            return { sdk: createAnthropic(options), options: "anthropic" };
          case "google":
            return { sdk: createGoogleGenerativeAI(options), options: "google" };
        }
    }
    switch (entry.npm) {
      case "@ai-sdk/openai":
        return { sdk: createOpenAI(options), options: "openai" };
      case "@ai-sdk/anthropic":
        return { sdk: createAnthropic(options), options: "anthropic" };
      case "@ai-sdk/google":
        return { sdk: createGoogleGenerativeAI(options), options: "google" };
      case "@ai-sdk/google-vertex":
        return { sdk: createGoogleVertex(options), options: "google" };
      case "@ai-sdk/azure":
        return {
          sdk: createAzure({ ...options, resourceName: settings.resourceName }),
          options: "openai",
        };
      case "@ai-sdk/amazon-bedrock":
        return {
          sdk: createAmazonBedrock({ ...options, region: settings.region }),
          options: "bedrock",
        };
      case "@ai-sdk/gateway":
        return { sdk: createGateway(options), options: "gateway" };
      case "@ai-sdk/xai":
        return { sdk: createXai(options), options: "xai" };
      case "@ai-sdk/mistral":
        return { sdk: createMistral(options), options: "mistral" };
      case "@ai-sdk/groq":
        return { sdk: createGroq(options), options: "groq" };
      case "@ai-sdk/cohere":
        return { sdk: createCohere(options), options: "cohere" };
      case "@ai-sdk/deepinfra":
        return { sdk: createDeepInfra(options), options: "deepinfra" };
      case "@ai-sdk/togetherai":
        return { sdk: createTogetherAI(options), options: "togetherai" };
      case "@ai-sdk/cerebras":
        return { sdk: createCerebras(options), options: "cerebras" };
      case "@ai-sdk/perplexity":
        return { sdk: createPerplexity(options), options: "perplexity" };
    }
    if (!baseURL) {
      throw new AppError("AI_PROVIDER_INVALID", "请填写服务地址", HttpStatus.BAD_REQUEST);
    }
    return {
      sdk: createOpenAICompatible({ ...options, name: provider.kind, baseURL, includeUsage: true }),
      options: provider.kind,
      thinkTags: true,
    };
  }

  async language(
    userId: string,
    providerId?: string,
  ): Promise<{ model: LanguageModel; provider: ResolvedProvider }> {
    const provider = await this.providers.resolve(userId, providerId);
    const settings = providerSettings.parse(provider.settings);
    const { sdk, options: namespace, thinkTags } = await this.sdk(provider);
    const model =
      provider.kind === "openai" &&
      (settings.protocol === "chat" || (provider.base_url && !settings.protocol))
        ? createOpenAI({ apiKey: provider.apiKey, baseURL: provider.base_url ?? undefined }).chat(
            provider.model,
          )
        : sdk.languageModel(provider.model);
    const effort = settings.reasoning;
    const budget = effort === "none" ? undefined : settings.thinkingBudget;
    const options: NonNullable<Parameters<typeof generateText>[0]["providerOptions"]> = {};
    let reasoning =
      effort === "max" || effort === "default" ? undefined : effort === "enabled" ? "high" : effort;
    if (namespace === "google") {
      if (budget !== undefined) options.google = { thinkingConfig: { thinkingBudget: budget } };
    } else if (namespace === "anthropic") {
      if (budget !== undefined)
        options.anthropic = { thinking: { type: "enabled", budgetTokens: budget } };
      else if (effort === "max")
        options.anthropic = { thinking: { type: "adaptive" }, effort: "max" };
    } else if (namespace === "alibaba") {
      options.alibaba = {
        ...(effort && effort !== "provider-default" && { enableThinking: effort !== "none" }),
        ...(budget !== undefined && { thinkingBudget: budget }),
      };
      reasoning = undefined;
    } else if (namespace === "bedrock") {
      if (budget !== undefined)
        options.bedrock = { reasoningConfig: { type: "enabled", budgetTokens: budget } };
      else if (effort === "max")
        options.bedrock = { reasoningConfig: { type: "adaptive", maxReasoningEffort: "max" } };
    } else if (namespace === "fireworks" && budget !== undefined) {
      options.fireworks = { thinking: { type: "enabled", budgetTokens: budget } };
    } else if (namespace === "openrouter" && effort && effort !== "provider-default") {
      options.openrouter = {
        reasoning: {
          ...(effort === "none"
            ? { enabled: false }
            : effort === "enabled"
              ? { enabled: true }
              : { effort }),
          ...(budget !== undefined && { max_tokens: budget }),
        },
      };
      reasoning = undefined;
    } else if (effort === "max" || effort === "default") {
      options[namespace] = { reasoningEffort: effort };
    }
    return {
      provider,
      model: wrapLanguageModel({
        model,
        middleware: [
          defaultSettingsMiddleware({
            settings: {
              temperature: settings.temperature,
              topP: settings.topP,
              maxOutputTokens: settings.maxOutputTokens,
              presencePenalty: settings.presencePenalty,
              frequencyPenalty: settings.frequencyPenalty,
              providerOptions: options,
            },
          }),
          {
            specificationVersion: "v4",
            transformParams: async ({ params }) => ({
              ...params,
              reasoning: params.reasoning ?? reasoning,
            }),
          },
          ...(thinkTags ? [extractReasoningMiddleware({ tagName: "think" })] : []),
        ],
      }),
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
    const { sdk } = await this.sdk(provider);
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
        maxOutputTokens: 2048,
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
