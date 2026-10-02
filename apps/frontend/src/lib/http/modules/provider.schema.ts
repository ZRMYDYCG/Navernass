import { z } from "zod";

export const providerKindSchema = z.enum([
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "qwen",
  "glm",
  "xai",
  "mistral",
  "groq",
  "cohere",
  "deepinfra",
  "togetherai",
  "fireworks",
  "cerebras",
  "perplexity",
  "moonshotai",
  "minimax",
  "azure",
  "bedrock",
  "vertex",
  "gateway",
  "baseten",
  "huggingface",
  "gmicloud",
  "zai",
  "anthropic_aws",
  "openrouter",
  "siliconflow",
  "ollama",
  "compatible",
]);

export const providerConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: providerKindSchema,
  base_url: z.string().nullable(),
  model: z.string(),
  embedding_model: z.string().nullable(),
  supports_tools: z.boolean(),
  supports_structured: z.boolean(),
  is_default: z.boolean(),
  is_enabled: z.boolean(),
  settings: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
});

export const providerPayloadSchema = z.object({
  name: z.string().trim().min(1),
  kind: providerKindSchema,
  baseUrl: z.string().trim().url().nullable().optional(),
  apiKey: z.string().trim().min(1).optional(),
  model: z.string().trim().min(1),
  embeddingModel: z.string().trim().nullable().optional(),
  supportsTools: z.boolean(),
  supportsStructured: z.boolean(),
  isDefault: z.boolean(),
  isEnabled: z.boolean().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const providerTestResultSchema = z.object({
  providerId: z.string(),
  model: z.string(),
  response: z.string(),
  usage: z.unknown().optional(),
  latencyMs: z.number(),
});

export type ProviderKind = z.infer<typeof providerKindSchema>;
export type ProviderConfig = z.infer<typeof providerConfigSchema>;
export type ProviderPayload = z.infer<typeof providerPayloadSchema>;
export type ProviderTestResult = z.infer<typeof providerTestResultSchema>;
