import type { ConfigService } from "@nestjs/config";
import type { EnvConfig } from "../src/config/env-schema.js";
import type { PrismaService } from "../src/database/prisma.service.js";
import type { AgentErrorService } from "../src/agent/error.service.js";
import type { SecretService } from "../src/agent/secret.service.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateText } from "ai";
import { createProvider, updateProvider } from "../src/agent/agent.schema.js";
import { CatalogService } from "../src/agent/catalog.service.js";
import { ModelService } from "../src/agent/model.service.js";
import { ProviderService } from "../src/agent/provider.service.js";

type ResolvedProvider = Awaited<ReturnType<ProviderService["resolve"]>>;
function config(overrides: Partial<ResolvedProvider> = {}): ResolvedProvider {
  return {
    id: "provider-1",
    user_id: "user-1",
    name: "Test",
    kind: "openai",
    base_url: null,
    api_key_cipher: "encrypted",
    apiKey: "test-key",
    model: "test-model",
    embedding_model: null,
    supports_tools: true,
    supports_structured: true,
    is_default: true,
    is_enabled: true,
    settings: {},
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}
function models(provider: ResolvedProvider) {
  return new ModelService(
    { get: () => 0 } as unknown as ConfigService<EnvConfig, true>,
    { resolve: vi.fn().mockResolvedValue(provider) } as unknown as ProviderService,
    { toAppError: (error: unknown) => error } as AgentErrorService,
    new CatalogService(),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("model provider routing", () => {
  it.each(
    [
      "openai anthropic google google-vertex azure amazon-bedrock vercel",
      "xai mistral groq cohere deepinfra togetherai cerebras perplexity",
      "deepseek alibaba-cn moonshotai zai zhipuai fireworks-ai minimax",
      "baseten huggingface gmicloud anthropic_aws ollama compatible",
      "openrouter siliconflow-cn volcengine minimax-cn meta",
    ].flatMap((line) => line.split(" ")),
  )("constructs a language model for %s", async (kind) => {
    const service = models(
      config({
        kind,
        base_url: kind === "compatible" ? "https://custom.example/v1" : null,
        settings: {
          region: "us-east-1",
          resourceName: "test-resource",
          workspaceId: "test-workspace",
        },
      }),
    );
    const { model } = await service.language("user-1");
    expect(model).toMatchObject({ modelId: "test-model", specificationVersion: "v4" });
  });

  it.each([
    { kind: "openai", settings: {}, path: "/v1/responses", auth: "authorization" },
    {
      kind: "openai",
      settings: { protocol: "chat" },
      path: "/v1/chat/completions",
      auth: "authorization",
    },
    {
      kind: "compatible",
      settings: { protocol: "chat" },
      path: "/v1/chat/completions",
      auth: "authorization",
    },
    {
      kind: "compatible",
      settings: { protocol: "responses" },
      path: "/v1/responses",
      auth: "authorization",
    },
    {
      kind: "compatible",
      settings: { protocol: "open-responses" },
      path: "/v1/responses",
      auth: "authorization",
    },
    {
      kind: "compatible",
      settings: { protocol: "anthropic" },
      path: "/v1/messages",
      auth: "x-api-key",
    },
    {
      kind: "compatible",
      settings: { protocol: "google" },
      path: "/v1/models/test-model:generateContent",
      auth: "x-goog-api-key",
    },
  ] as const)(
    "sends $kind/$settings.protocol requests to $path",
    async ({ kind, settings, path, auth }) => {
      const fetch = vi.fn().mockResolvedValue(
        new Response('{"error":{"message":"test endpoint"}}', {
          status: 400,
          headers: { "content-type": "application/json" },
        }),
      );
      vi.stubGlobal("fetch", fetch);
      const provider = config({
        kind,
        base_url: "https://custom.example/v1",
        settings: {
          ...settings,
          ...(kind === "openai" && !("protocol" in settings) ? { protocol: "responses" } : {}),
        },
      });
      const { model } = await models(provider).language("user-1");
      await expect(generateText({ model, prompt: "hello", maxRetries: 0 })).rejects.toThrow();
      expect(fetch).toHaveBeenCalledOnce();
      const [url, request] = fetch.mock.calls[0]!;
      expect(String(url)).toBe(`https://custom.example${path}`);
      expect(new Headers(request.headers).get(auth)).toBe(
        auth === "authorization" ? "Bearer test-key" : "test-key",
      );
      expect(JSON.parse(request.body)).toEqual(
        expect.objectContaining(
          kind === "compatible" && settings.protocol === "google" ? {} : { model: "test-model" },
        ),
      );
    },
  );

  it("keeps existing OpenAI proxy configurations on Chat Completions", async () => {
    const { model } = await models(config({ base_url: "https://proxy.example/v1" })).language(
      "user-1",
    );
    expect(model).toMatchObject({ provider: "openai.chat" });
  });

  it("sends catalog-only providers to their catalog endpoint", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response('{"error":{"message":"test endpoint"}}', {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetch);
    const { model } = await models(config({ kind: "volcengine" })).language("user-1");
    await expect(generateText({ model, prompt: "hello", maxRetries: 0 })).rejects.toThrow();
    expect(String(fetch.mock.calls[0]![0])).toBe(
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    );
  });

  it("rejects a custom provider without an endpoint", async () => {
    await expect(models(config({ kind: "compatible" })).language("user-1")).rejects.toThrow(
      "请填写服务地址",
    );
  });

  it("uses native embeddings and reports unsupported providers", async () => {
    const service = models(config({ kind: "cohere", embedding_model: "embed-v4.0" }));
    expect((await service.embedding("user-1")).model).toMatchObject({
      modelId: "embed-v4.0",
      specificationVersion: "v4",
    });
    await expect(
      models(config({ kind: "anthropic", embedding_model: "invalid" })).embedding("user-1"),
    ).rejects.toThrow("当前厂商不支持此嵌入模型");
  });
});

describe("provider configuration persistence", () => {
  function providers(current = config()) {
    const tx = { aiProviderConfig: { create: vi.fn(), update: vi.fn(), updateMany: vi.fn() } };
    const prisma = {
      aiProviderConfig: { findFirst: vi.fn().mockResolvedValue(current) },
      $transaction: (run: (transaction: typeof tx) => unknown) => run(tx),
    };
    const secrets = { encrypt: vi.fn().mockReturnValue("new-encrypted-key") };
    const service = new ProviderService(
      prisma as unknown as PrismaService,
      secrets as unknown as SecretService,
      new CatalogService(),
    );
    return { service, tx, secrets };
  }

  it("clears URL and embedding model while preserving an omitted key and settings", async () => {
    const { service, tx, secrets } = providers();
    await service.update(
      "user-1",
      "provider-1",
      updateProvider.parse({ baseUrl: null, embeddingModel: null }),
    );
    expect(tx.aiProviderConfig.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ base_url: null, embedding_model: null }),
      }),
    );
    expect(tx.aiProviderConfig.update.mock.calls[0]![0].data).not.toHaveProperty("api_key_cipher");
    expect(tx.aiProviderConfig.update.mock.calls[0]![0].data).not.toHaveProperty("settings");
    expect(tx.aiProviderConfig.update.mock.calls[0]![0].data.supports_tools).toBeUndefined();
    expect(tx.aiProviderConfig.update.mock.calls[0]![0].data.is_default).toBeUndefined();
    expect(secrets.encrypt).not.toHaveBeenCalled();
  });

  it("encrypts a replacement key and never selects it for the response", async () => {
    const { service, tx, secrets } = providers();
    await service.update("user-1", "provider-1", updateProvider.parse({ apiKey: "new-key" }));
    expect(secrets.encrypt).toHaveBeenCalledWith("new-key");
    const request = tx.aiProviderConfig.update.mock.calls[0]![0];
    expect(request.data.api_key_cipher).toBe("new-encrypted-key");
    expect(request.select).not.toHaveProperty("api_key_cipher");
  });

  it("validates merged configuration when removing required endpoints", async () => {
    const { service, tx } = providers(
      config({ kind: "compatible", base_url: "https://custom.example/v1" }),
    );
    await expect(
      service.update("user-1", "provider-1", updateProvider.parse({ baseUrl: null })),
    ).rejects.toThrow("请补全厂商");
    expect(tx.aiProviderConfig.update).not.toHaveBeenCalled();
  });

  it("rejects providers outside the catalog", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { service, tx } = providers();
    await expect(
      service.create(
        "user-1",
        createProvider.parse({ name: "Test", kind: "unknown-vendor", apiKey: "test", model: "x" }),
      ),
    ).rejects.toThrow("不支持的模型厂商");
    expect(tx.aiProviderConfig.create).not.toHaveBeenCalled();
  });

  it.each(["azure", "amazon-bedrock", "anthropic_aws", "compatible"] as const)(
    "requires connection settings for %s",
    async (kind) => {
      const { service, tx } = providers();
      await expect(
        service.create(
          "user-1",
          createProvider.parse({ name: "Test", kind, apiKey: "test", model: "test" }),
        ),
      ).rejects.toThrow("请补全厂商");
      expect(tx.aiProviderConfig.create).not.toHaveBeenCalled();
    },
  );

  it("rejects non-HTTP URLs and unknown protocols at the boundary", () => {
    expect(updateProvider.safeParse({ baseUrl: "file:///tmp/model" }).success).toBe(false);
    expect(updateProvider.safeParse({ settings: { protocol: "unsupported" } }).success).toBe(false);
  });
});
