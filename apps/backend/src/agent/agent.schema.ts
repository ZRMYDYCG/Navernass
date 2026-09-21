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

export const askQuestionType = z.enum(["text", "singleChoice", "multiChoice", "confirm"]);

const askOption = z.object({
  value: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(100),
  description: z.string().trim().max(300).optional(),
});

const askQuestion = z
  .object({
    id: z
      .string()
      .trim()
      .regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/),
    header: z.string().trim().min(1).max(40),
    question: z.string().trim().min(1).max(1_000),
    type: askQuestionType,
    options: z.array(askOption).max(10).default([]),
    required: z.boolean().default(true),
    allowCustom: z.boolean().default(false),
    placeholder: z.string().trim().max(200).optional(),
  })
  .superRefine((question, context) => {
    if (["singleChoice", "multiChoice"].includes(question.type) && question.options.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "选择题至少需要两个选项",
      });
    }
    const values = question.options.map((option) => option.value);
    if (new Set(values).size !== values.length) {
      context.addIssue({ code: "custom", path: ["options"], message: "选项 value 不能重复" });
    }
  });

/** Agent 主动请求用户补充决策，前端应在输入框上方渲染而非聊天气泡中。 */
export const askUserInput = z.object({
  title: z.string().trim().min(1).max(100).default("需要你的决定"),
  reason: z.string().trim().max(500).optional(),
  questions: z
    .array(askQuestion)
    .min(1)
    .max(4)
    .refine(
      (questions) => new Set(questions.map((question) => question.id)).size === questions.length,
      "问题 id 不能重复",
    ),
});

const askAnswerValue = z.union([
  z.string().trim().min(1).max(20_000),
  z.array(z.string().trim().min(1).max(100)).max(10),
  z.boolean(),
]);

export const answerQuestion = z.object({
  answers: z.record(z.string(), askAnswerValue),
});

export const dismissQuestion = z.object({
  reason: z.string().trim().min(1).max(500).default("用户取消了本次提问"),
});

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
  status: z
    .enum(["queued", "running", "waiting_input", "completed", "failed", "cancelled"])
    .optional(),
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
export type AskUserInput = z.infer<typeof askUserInput>;
export type AnswerQuestion = z.infer<typeof answerQuestion>;
export type DismissQuestion = z.infer<typeof dismissQuestion>;
export type StructuredAgent = z.infer<typeof structuredAgent>;
export type SessionQuery = z.infer<typeof sessionQuery>;
export type MessageQuery = z.infer<typeof messageQuery>;
export type UpdateSession = z.infer<typeof updateSession>;
export type SaveMemory = z.infer<typeof saveMemory>;
export type SearchMemory = z.infer<typeof searchMemory>;
export type SyncMemory = z.infer<typeof syncMemory>;
