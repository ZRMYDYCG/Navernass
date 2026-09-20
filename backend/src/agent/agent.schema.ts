import { z } from 'zod'

export const providerKind = z.enum(['openai', 'anthropic', 'google', 'deepseek', 'qwen', 'glm', 'compatible'])
export const agentRole = z.enum(['main', 'character', 'plot', 'world', 'style', 'reviewer'])
export const memoryKind = z.enum(['chapter', 'character', 'worldbook', 'outline', 'timeline', 'summary', 'conversation', 'custom'])

export const createProvider = z.object({
  name: z.string().trim().min(1).max(100),
  kind: providerKind,
  baseUrl: z.url().max(500).optional(),
  apiKey: z.string().trim().min(1).max(10_000),
  model: z.string().trim().min(1).max(191),
  embeddingModel: z.string().trim().max(191).optional(),
  supportsTools: z.boolean().default(true),
  supportsStructured: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  settings: z.record(z.string(), z.unknown()).default({}),
})

export const updateProvider = createProvider.partial().extend({
  apiKey: z.string().trim().min(1).max(10_000).optional(),
  isEnabled: z.boolean().optional(),
})

export const runAgent = z.object({
  novelId: z.uuid(),
  chapterId: z.uuid().optional(),
  providerId: z.uuid().optional(),
  sessionId: z.uuid().optional(),
  role: agentRole.default('main'),
  prompt: z.string().trim().min(1).max(100_000),
  maxSteps: z.number().int().min(1).max(50).optional(),
  temperature: z.number().min(0).max(2).optional(),
  context: z.record(z.string(), z.unknown()).default({}),
})

export const structuredAgent = runAgent.extend({
  outputType: z.enum(['chapterPlan', 'characterProfile', 'continuityReview']),
})

export const runQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  novelId: z.uuid().optional(),
  status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']).optional(),
})

export const sessionQuery = z.object({
  novelId: z.uuid(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const messageQuery = z.object({
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export const updateSession = z.object({
  title: z.string().trim().min(1).max(255),
})

export const saveMemory = z.object({
  novelId: z.uuid(),
  chapterId: z.uuid().nullable().optional(),
  sourceId: z.uuid().nullable().optional(),
  kind: memoryKind,
  title: z.string().trim().max(255).optional(),
  content: z.string().trim().min(1).max(2_000_000),
  metadata: z.record(z.string(), z.unknown()).default({}),
  providerId: z.uuid().optional(),
})

export const searchMemory = z.object({
  novelId: z.uuid(),
  query: z.string().trim().min(1).max(2_000),
  kinds: z.array(memoryKind).max(8).optional(),
  chapterId: z.uuid().optional(),
  providerId: z.uuid().optional(),
  limit: z.number().int().min(1).max(30).default(8),
  minScore: z.number().min(0).max(1).default(0.2),
})

export const syncMemory = z.object({
  novelId: z.uuid(),
  providerId: z.uuid().optional(),
  kinds: z.array(z.enum(['chapter', 'worldbook', 'outline', 'timeline'])).min(1).max(4).default(['chapter', 'worldbook', 'outline', 'timeline']),
})

export type CreateProvider = z.infer<typeof createProvider>
export type UpdateProvider = z.infer<typeof updateProvider>
export type RunAgent = z.infer<typeof runAgent>
export type StructuredAgent = z.infer<typeof structuredAgent>
export type SessionQuery = z.infer<typeof sessionQuery>
export type MessageQuery = z.infer<typeof messageQuery>
export type UpdateSession = z.infer<typeof updateSession>
export type SaveMemory = z.infer<typeof saveMemory>
export type SearchMemory = z.infer<typeof searchMemory>
export type SyncMemory = z.infer<typeof syncMemory>
