import { z } from "zod";
import { skillMode } from "../skill/skill.schema.js";

export const providerKind = z.enum([
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "qwen",
  "glm",
  "compatible",
]);
export const agentRole = z.enum(["main", "character", "plot", "world", "style", "reviewer"]);
export const memoryKind = z.enum([
  "chapter",
  "character",
  "worldbook",
  "outline",
  "timeline",
  "summary",
  "conversation",
  "custom",
]);

export const contextSource = z.enum([
  "novel",
  "chapter",
  "chapterIndex",
  "volumes",
  "characters",
  "relationships",
  "worldbook",
  "outlines",
  "timeline",
  "rag",
  "session",
  "request",
]);

export const contextTrust = z.enum(["trusted", "reference", "untrusted"]);

const contextPriority = z.number().int().min(0).max(100);
const chapterSelection = z
  .object({
    start: z.number().int().min(0),
    end: z.number().int().positive(),
  })
  .refine((range) => range.end > range.start, {
    message: "章节选区的 end 必须大于 start",
    path: ["end"],
  });

/** 调用方临时注入的可追踪上下文块。 */
export const contextBlock = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(255).optional(),
  content: z.string().trim().min(1).max(200_000),
  priority: contextPriority.default(70),
  trust: contextTrust.default("reference"),
  roles: z.array(agentRole).min(1).max(6).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

/**
 * 请求级上下文装配策略。调用方可以选择资料源、覆盖优先级、限制预算，
 * 也可以传入编辑器选区和临时上下文块；未传时保持开箱即用的默认策略。
 */
export const contextOptions = z.object({
  sources: z
    .array(contextSource)
    .min(1)
    .max(contextSource.options.length)
    .refine((sources) => new Set(sources).size === sources.length, "上下文来源不能重复")
    .default([...contextSource.options]),
  strategy: z.enum(["priority", "balanced"]).default("balanced"),
  maxChars: z.number().int().min(2_000).max(500_000).default(120_000),
  maxBlockChars: z.number().int().min(500).max(100_000).default(30_000),
  sourcePriorities: z
    .object({
      novel: contextPriority.optional(),
      chapter: contextPriority.optional(),
      chapterIndex: contextPriority.optional(),
      volumes: contextPriority.optional(),
      characters: contextPriority.optional(),
      relationships: contextPriority.optional(),
      worldbook: contextPriority.optional(),
      outlines: contextPriority.optional(),
      timeline: contextPriority.optional(),
      rag: contextPriority.optional(),
      session: contextPriority.optional(),
      request: contextPriority.optional(),
    })
    .default({}),
  chapter: z
    .object({
      includeContent: z.boolean().default(true),
      selection: chapterSelection.optional(),
      surroundingChars: z.number().int().min(0).max(20_000).default(2_000),
    })
    .default({ includeContent: true, surroundingChars: 2_000 }),
  rag: z
    .object({
      enabled: z.boolean().default(true),
      query: z.string().trim().min(1).max(2_000).optional(),
      kinds: z.array(memoryKind).min(1).max(memoryKind.options.length).optional(),
      limit: z.number().int().min(1).max(30).default(8),
      minScore: z.number().min(0).max(1).default(0.2),
    })
    .default({ enabled: true, limit: 8, minScore: 0.2 }),
  blocks: z.array(contextBlock).max(30).default([]),
});

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
});

export const updateProvider = createProvider.partial().extend({
  apiKey: z.string().trim().min(1).max(10_000).optional(),
  isEnabled: z.boolean().optional(),
});

export const runAgent = z.object({
  requestId: z.uuid().optional(),
  novelId: z.uuid(),
  chapterId: z.uuid().optional(),
  providerId: z.uuid().optional(),
  sessionId: z.uuid().optional(),
  role: agentRole.default("main"),
  mode: skillMode.default("agent"),
  skillIds: z
    .array(z.string().trim().min(1).max(64))
    .max(20)
    .refine((ids) => new Set(ids).size === ids.length, "skillIds 不能重复")
    .optional(),
  prompt: z.string().trim().min(1).max(100_000),
  maxSteps: z.number().int().min(1).max(50).optional(),
  temperature: z.number().min(0).max(2).optional(),
  context: z.record(z.string(), z.unknown()).default({}),
  contextOptions: contextOptions.default({
    sources: [...contextSource.options],
    strategy: "balanced",
    maxChars: 120_000,
    maxBlockChars: 30_000,
    sourcePriorities: {},
    chapter: { includeContent: true, surroundingChars: 2_000 },
    rag: { enabled: true, limit: 8, minScore: 0.2 },
    blocks: [],
  }),
});

export const previewContext = runAgent
  .omit({ maxSteps: true, temperature: true })
  .extend({ includeRendered: z.boolean().default(false) });

export const structuredAgent = runAgent.extend({
  outputType: z.enum(["chapterPlan", "characterProfile", "continuityReview"]),
});

export const runQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  novelId: z.uuid().optional(),
  status: z.enum(["queued", "running", "completed", "failed", "cancelled"]).optional(),
});

export const replayStream = z.object({
  after: z.coerce.number().int().min(0).default(0),
});

export const retryRun = z.object({
  requestId: z.uuid().optional(),
});

const askUserOption = z.object({
  id: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(200),
});

/** askUser 工具入参：一次最多四个相关问题，每题 2–8 个选项，前端固定追加「其他」自由填写。 */
export const askUserInput = z.object({
  title: z.string().trim().max(100).optional(),
  questions: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(64),
        prompt: z.string().trim().min(1).max(1_000),
        options: z.array(askUserOption).min(2).max(8),
        allowMultiple: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(4),
});

/** askUser 工具结果：回答或跳过。跳过同样是合法结果，保证对话永远不会停在未完成的工具调用上。 */
export const askUserOutput = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("answered"),
    answers: z
      .array(
        z.object({
          questionId: z.string().trim().min(1).max(64),
          selected: z.array(z.string().trim().min(1).max(64)).max(8).default([]),
          other: z.string().trim().min(1).max(2_000).optional(),
        }),
      )
      .min(1)
      .max(4),
  }),
  z.object({
    status: z.literal("skipped"),
    reason: z.enum(["user_skipped", "user_sent_message"]).default("user_skipped"),
  }),
]);

export const answerTool = z.object({
  toolCallId: z.string().trim().min(1).max(191),
  output: askUserOutput,
});

export const sessionQuery = z.object({
  novelId: z.uuid(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const messageQuery = z.object({
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const updateSession = z.object({
  title: z.string().trim().min(1).max(255),
});

export const saveMemory = z.object({
  novelId: z.uuid(),
  chapterId: z.uuid().nullable().optional(),
  sourceId: z.uuid().nullable().optional(),
  kind: memoryKind,
  title: z.string().trim().max(255).optional(),
  content: z.string().trim().min(1).max(2_000_000),
  metadata: z.record(z.string(), z.unknown()).default({}),
  providerId: z.uuid().optional(),
});

export const searchMemory = z.object({
  novelId: z.uuid(),
  query: z.string().trim().min(1).max(2_000),
  kinds: z.array(memoryKind).max(8).optional(),
  chapterId: z.uuid().optional(),
  providerId: z.uuid().optional(),
  limit: z.number().int().min(1).max(30).default(8),
  minScore: z.number().min(0).max(1).default(0.2),
});

export const syncMemory = z.object({
  novelId: z.uuid(),
  providerId: z.uuid().optional(),
  kinds: z
    .array(z.enum(["chapter", "worldbook", "outline", "timeline"]))
    .min(1)
    .max(4)
    .default(["chapter", "worldbook", "outline", "timeline"]),
});

export type CreateProvider = z.infer<typeof createProvider>;
export type UpdateProvider = z.infer<typeof updateProvider>;
export type RunAgent = z.infer<typeof runAgent>;
export type PreviewContext = z.infer<typeof previewContext>;
export type ContextOptions = z.infer<typeof contextOptions>;
export type ContextSource = z.infer<typeof contextSource>;
export type ContextTrust = z.infer<typeof contextTrust>;
export type ReplayStream = z.infer<typeof replayStream>;
export type RetryRun = z.infer<typeof retryRun>;
export type AskUserInput = z.infer<typeof askUserInput>;
export type AskUserOutput = z.infer<typeof askUserOutput>;
export type AnswerTool = z.infer<typeof answerTool>;
export type StructuredAgent = z.infer<typeof structuredAgent>;
export type SessionQuery = z.infer<typeof sessionQuery>;
export type MessageQuery = z.infer<typeof messageQuery>;
export type UpdateSession = z.infer<typeof updateSession>;
export type SaveMemory = z.infer<typeof saveMemory>;
export type SearchMemory = z.infer<typeof searchMemory>;
export type SyncMemory = z.infer<typeof syncMemory>;
