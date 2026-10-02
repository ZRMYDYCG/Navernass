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

type ResolvedProvider = Awaited<ReturnType<ProviderService["resolve"]>>;

const catalogModel = z.object({
  id: z.string(),
  name: z.string(),
  reasoning: z.boolean().optional(),
  temperature: z.boolean().optional(),
  tool_call: z.boolean().optional(),
  structured_output: z.boolean().optional(),
  modalities: z.object({ input: z.array(z.string()), output: z.array(z.string()) }),
  limit: z.object({ context: z.number(), output: z.number() }),
  reasoning_options: z
    .array(
      z.object({
        type: z.enum(["effort", "toggle", "budget_tokens"]),
        values: z.array(z.string().nullable()).optional(),
        min: z.number().optional(),
        max: z.number().optional(),
      }),
    )
    .optional(),
  release_date: z.string().optional(),
  status: z.string().optional(),
});
const catalogSchema = z.record(z.string(), z.object({ models: z.record(z.string(), z.unknown()) }));
const catalogIds: Partial<Record<ResolvedProvider["kind"], string>> = {
  qwen: "alibaba-cn",
  glm: "zhipuai",
  bedrock: "amazon-bedrock",
  vertex: "google-vertex",
  gateway: "vercel",
  fireworks: "fireworks-ai",
  anthropic_aws: "anthropic",
  siliconflow: "siliconflow-cn",
};
const discoveryUrls: Partial<Record<ResolvedProvider["kind"], string>> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  google: "https://generativelanguage.googleapis.com/v1beta",
  deepseek: "https://api.deepseek.com",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  groq: "https://api.groq.com/openai/v1",
  mistral: "https://api.mistral.ai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  siliconflow: "https://api.siliconflow.cn/v1",
  ollama: "http://localhost:11434/v1",
};
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
  private catalogCache?: { data: z.infer<typeof catalogSchema>; fetchedAt: number };

  async catalog(kind: ResolvedProvider["kind"]) {
    if (kind === "compatible" || kind === "ollama") return [];
    if (!this.catalogCache || Date.now() - this.catalogCache.fetchedAt > 3_600_000) {
      try {
        const response = await fetch("https://models.dev/api.json", {
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new Error("catalog unavailable");
        this.catalogCache = {
          data: catalogSchema.parse(await response.json()),
          fetchedAt: Date.now(),
        };
      } catch {
        throw new AppError(
          "AI_PROVIDER_UNAVAILABLE",
          "模型目录暂时无法加载，请重试、从账号获取或手动填写模型 ID",
          HttpStatus.BAD_GATEWAY,
        );
      }
    }
    return Object.values(this.catalogCache.data[catalogIds[kind] ?? kind]?.models ?? {})
      .flatMap((value) => {
        const parsed = catalogModel.safeParse(value);
        if (
          !parsed.success ||
          parsed.data.status === "deprecated" ||
          !parsed.data.modalities.output.includes("text")
        )
          return [];
        const model = parsed.data;
        return [
          {
            id: model.id,
            name: model.name,
            reasoning: model.reasoning ?? false,
            temperature: model.temperature,
            tools: model.tool_call,
            structured: model.structured_output,
            contextWindow: model.limit.context,
            maxOutputTokens: model.limit.output,
            input: model.modalities.input,
            reasoningOptions: (model.reasoning_options ?? []).map((option) => ({
              ...option,
              values: option.values?.filter((value) => value !== null),
            })),
            releaseDate: model.release_date ?? "",
          },
        ];
      })
      .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.name.localeCompare(b.name));
  }

  async discover(userId: string, input: DiscoverModels) {
    const saved = input.providerId
      ? await this.providers.credentials(userId, input.providerId)
      : undefined;
    const apiKey = input.apiKey ?? saved?.apiKey;
    if (!apiKey && input.kind !== "ollama")
      throw new AppError("AI_PROVIDER_INVALID", "请先填写 API Key", HttpStatus.BAD_REQUEST);
    const baseURL = input.baseUrl ?? discoveryUrls[input.kind];
    if (!baseURL)
      throw new AppError(
        "AI_PROVIDER_INVALID",
        "此厂商暂不支持账号模型查询，请使用公开目录或手动输入",
        HttpStatus.BAD_REQUEST,
      );
    const protocol = input.kind === "compatible" ? input.protocol : input.kind;
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
    const model =
      provider.kind === "openai" &&
      (settings.protocol === "chat" || (provider.base_url && !settings.protocol))
        ? createOpenAI({ apiKey: provider.apiKey, baseURL: provider.base_url ?? undefined }).chat(
            provider.model,
          )
        : this.sdk(provider).languageModel(provider.model);
    const kind = provider.kind === "compatible" ? (settings.protocol ?? "chat") : provider.kind;
    const effort = settings.reasoning;
    const budget = effort === "none" ? undefined : settings.thinkingBudget;
    const options: NonNullable<Parameters<typeof generateText>[0]["providerOptions"]> = {};
    let reasoning =
      effort === "max" || effort === "default" ? undefined : effort === "enabled" ? "high" : effort;
    if (kind === "google" || kind === "vertex") {
      if (budget !== undefined) options.google = { thinkingConfig: { thinkingBudget: budget } };
    } else if (kind === "anthropic" || kind === "anthropic_aws") {
      if (budget !== undefined)
        options.anthropic = { thinking: { type: "enabled", budgetTokens: budget } };
      else if (effort === "max")
        options.anthropic = { thinking: { type: "adaptive" }, effort: "max" };
    } else if (kind === "qwen") {
      options.alibaba = {
        ...(effort && effort !== "provider-default" && { enableThinking: effort !== "none" }),
        ...(budget !== undefined && { thinkingBudget: budget }),
      };
      reasoning = undefined;
    } else if (kind === "bedrock") {
      if (budget !== undefined)
        options.bedrock = { reasoningConfig: { type: "enabled", budgetTokens: budget } };
      else if (effort === "max")
        options.bedrock = { reasoningConfig: { type: "adaptive", maxReasoningEffort: "max" } };
    } else if (kind === "fireworks" && budget !== undefined) {
      options.fireworks = { thinking: { type: "enabled", budgetTokens: budget } };
    } else if (kind === "openrouter" && effort && effort !== "provider-default") {
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
      const namespaces: Record<string, string> = {
        azure: "openai",
        responses: "openai",
        "open-responses": "custom",
        glm: "zai",
        chat: "compatible",
      };
      const namespace = namespaces[kind] ?? kind;
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
          ...(["compatible", "ollama", "siliconflow", "openrouter"].includes(provider.kind)
            ? [extractReasoningMiddleware({ tagName: "think" })]
            : []),
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
