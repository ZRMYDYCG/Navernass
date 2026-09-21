import { z } from "zod";
import { agentRole, answerQuestion, contextOptions } from "../agent/agent.schema.js";
import { skillMode } from "../skill/skill.schema.js";

/** A2A Message 的 data Part 中承载的 Narraverse 执行上下文。 */
export const a2aContext = z.object({
  novelId: z.uuid(),
  chapterId: z.uuid().optional(),
  providerId: z.uuid().optional(),
  sessionId: z.uuid().optional(),
  role: agentRole.default("main"),
  mode: skillMode.default("agent"),
  skillIds: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
  maxSteps: z.number().int().min(1).max(50).optional(),
  temperature: z.number().min(0).max(2).optional(),
  context: z.record(z.string(), z.unknown()).default({}),
  contextOptions: contextOptions.default({
    sources: [
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
    ],
    strategy: "balanced",
    maxChars: 120_000,
    maxBlockChars: 30_000,
    sourcePriorities: {},
    chapter: { includeContent: true, surroundingChars: 2_000 },
    rag: { enabled: true, limit: 8, minScore: 0.2 },
    blocks: [],
  }),
  askAnswer: z
    .object({
      questionId: z.uuid(),
      answers: answerQuestion.shape.answers,
    })
    .optional(),
});

export type A2aContext = z.infer<typeof a2aContext>;
