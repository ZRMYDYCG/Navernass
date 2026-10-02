import { HttpStatus, Injectable } from "@nestjs/common";
import { z } from "zod";
import snapshot from "./provider-catalog.json" with { type: "json" };
import { AppError } from "../common/app-error.js";

const sdkPackage = z.enum([
  "@ai-sdk/openai",
  "@ai-sdk/anthropic",
  "@ai-sdk/anthropic-aws",
  "@ai-sdk/openai-compatible",
  "@ai-sdk/azure",
  "@ai-sdk/amazon-bedrock",
  "@ai-sdk/google",
  "@ai-sdk/google-vertex",
  "@ai-sdk/gateway",
  "@ai-sdk/xai",
  "@ai-sdk/mistral",
  "@ai-sdk/groq",
  "@ai-sdk/cohere",
  "@ai-sdk/deepinfra",
  "@ai-sdk/togetherai",
  "@ai-sdk/cerebras",
  "@ai-sdk/perplexity",
  "@openrouter/ai-sdk-provider",
]);
const catalogProvider = z.object({
  id: z.string(),
  name: z.string(),
  npm: sdkPackage,
  api: z.string().optional(),
  doc: z.string().optional(),
});
export type CatalogProvider = z.infer<typeof catalogProvider>;

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
const remoteProvider = z.object({ models: z.record(z.string(), z.unknown()) });

/** 不在 Models.dev 中、但由本应用直接支持的接入方式。 */
const builtins: CatalogProvider[] = [
  {
    id: "ollama",
    name: "Ollama",
    npm: "@ai-sdk/openai-compatible",
    api: "http://localhost:11434/v1",
    doc: "https://ollama.com/",
  },
  {
    id: "anthropic_aws",
    name: "Claude on AWS",
    npm: "@ai-sdk/anthropic-aws",
    doc: "https://console.aws.amazon.com/",
  },
  { id: "compatible", name: "Custom", npm: "@ai-sdk/openai-compatible" },
];
const fallback = new Map(
  z
    .array(catalogProvider)
    .parse(snapshot)
    .map((provider) => [provider.id, provider]),
);
/** 原生 SDK 未在目录中声明地址时，用于查询账号模型列表的默认地址。 */
const nativeModelUrls: Partial<Record<CatalogProvider["npm"], string>> = {
  "@ai-sdk/openai": "https://api.openai.com/v1",
  "@ai-sdk/anthropic": "https://api.anthropic.com/v1",
  "@ai-sdk/google": "https://generativelanguage.googleapis.com/v1beta",
  "@ai-sdk/xai": "https://api.x.ai/v1",
  "@ai-sdk/mistral": "https://api.mistral.ai/v1",
  "@ai-sdk/groq": "https://api.groq.com/openai/v1",
  "@ai-sdk/deepinfra": "https://api.deepinfra.com/v1/openai",
  "@ai-sdk/togetherai": "https://api.together.xyz/v1",
  "@ai-sdk/cerebras": "https://api.cerebras.ai/v1",
};
const ttl = 3_600_000;
const retryAfter = 300_000;

function toModel(value: unknown) {
  const parsed = catalogModel.safeParse(value);
  if (
    !parsed.success ||
    parsed.data.status === "deprecated" ||
    !parsed.data.modalities.output.includes("text")
  ) {
    return [];
  }
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
}
type CatalogModel = ReturnType<typeof toModel>[number];

/**
 * 厂商与模型目录：数据来自 Models.dev，按小时缓存；
 * 远程不可用时，厂商列表回退到内置快照，模型列表则提示用户从账号获取或手动填写。
 */
@Injectable()
export class CatalogService {
  private remote?: {
    providers: Map<string, CatalogProvider>;
    models: Map<string, CatalogModel[]>;
    fetchedAt: number;
  };
  private failedAt = 0;
  private loading?: Promise<void>;

  async providers() {
    await this.refresh();
    return [...builtins, ...(this.remote?.providers ?? fallback).values()].map((provider) => ({
      ...provider,
      discoverable: provider.id === "compatible" || !!this.modelsUrl(provider),
    }));
  }

  async provider(id: string) {
    const known =
      builtins.find((provider) => provider.id === id) ??
      this.remote?.providers.get(id) ??
      fallback.get(id);
    if (known) return known;
    await this.refresh();
    return this.remote?.providers.get(id);
  }

  async models(id: string) {
    await this.refresh();
    if (!this.remote) {
      throw new AppError(
        "AI_PROVIDER_UNAVAILABLE",
        "模型目录暂时无法加载，请重试、从账号获取或手动填写模型 ID",
        HttpStatus.BAD_GATEWAY,
      );
    }
    return this.remote.models.get(id === "anthropic_aws" ? "anthropic" : id) ?? [];
  }

  modelsUrl(provider: CatalogProvider) {
    return provider.api ?? nativeModelUrls[provider.npm];
  }

  private refresh() {
    const now = Date.now();
    if ((this.remote && now - this.remote.fetchedAt < ttl) || now - this.failedAt < retryAfter) {
      return Promise.resolve();
    }
    this.loading ??= this.load().finally(() => {
      this.loading = undefined;
    });
    return this.loading;
  }

  private async load() {
    try {
      const response = await fetch("https://models.dev/api.json", {
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = z.record(z.string(), z.unknown()).parse(await response.json());
      const providers = new Map<string, CatalogProvider>();
      const models = new Map<string, CatalogModel[]>();
      for (const [id, value] of Object.entries(data)) {
        const provider = catalogProvider.safeParse({ ...Object(value), id });
        const entry = remoteProvider.safeParse(value);
        if (!provider.success || !entry.success) continue;
        const list = Object.values(entry.data.models)
          .flatMap(toModel)
          .sort(
            (a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.name.localeCompare(b.name),
          );
        if (!list.length) continue;
        providers.set(id, provider.data);
        models.set(id, list);
      }
      this.remote = { providers, models, fetchedAt: Date.now() };
    } catch {
      this.failedAt = Date.now();
    }
  }
}
