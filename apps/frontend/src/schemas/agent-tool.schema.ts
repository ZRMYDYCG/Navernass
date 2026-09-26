import { z } from "zod";

/** 与后端 ToolService 的工具入参和返回值对应；只声明渲染需要的字段。 */

export const memoryKindSchema = z.enum([
  "chapter",
  "character",
  "worldbook",
  "outline",
  "timeline",
  "summary",
  "conversation",
  "custom",
]);

export const subagentRoleSchema = z.enum(["character", "plot", "world", "style", "reviewer"]);

export const loadSkillInputSchema = z.object({ skillId: z.string() });
export const loadSkillOutputSchema = z.object({
  id: z.string(),
  version: z.coerce.string().optional(),
  instructions: z.string(),
  allowedTools: z.array(z.string()),
  resources: z.array(z.string()),
});

export const readSkillResourceInputSchema = z.object({ skillId: z.string(), path: z.string() });
export const readSkillResourceOutputSchema = z.object({
  skillId: z.string(),
  path: z.string(),
  content: z.string(),
});

export const novelSnapshotOutputSchema = z.object({
  title: z.string(),
  word_count: z.number().optional(),
  chapters: z.array(z.unknown()),
  volumes: z.array(z.unknown()),
  worldbook: z.array(z.unknown()),
  outlines: z.array(z.unknown()),
  timeline_events: z.array(z.unknown()),
});

export const chapterOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  word_count: z.number(),
  revision: z.number(),
});

export const readArticleOutputSchema = z.object({
  chapterId: z.string(),
  title: z.string(),
  revision: z.number(),
  wordCount: z.number(),
  totalLength: z.number(),
  startOffset: z.number(),
  endOffset: z.number(),
  hasMore: z.boolean(),
  content: z.string(),
});

export const searchArticleInputSchema = z.object({ query: z.string() });
export const searchArticleOutputSchema = z.object({
  query: z.string(),
  matches: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
      before: z.string(),
      match: z.string(),
      after: z.string(),
    }),
  ),
  truncated: z.boolean(),
});

export const editOperationSchema = z.object({
  id: z.string(),
  type: z.enum(["replace", "insert_before", "insert_after", "prepend", "append"]),
  oldText: z.string(),
  newText: z.string(),
  anchor: z.string().optional(),
  reason: z.string(),
});

export const editStatusSchema = z.enum(["pending", "applied", "rejected", "stale"]);

export const proposeEditInputSchema = z.object({ summary: z.string() });
export const proposeEditOutputSchema = z.object({
  proposalId: z.string(),
  chapterId: z.string(),
  chapterTitle: z.string(),
  status: editStatusSchema,
  summary: z.string(),
  operations: z.array(editOperationSchema),
});

export const searchMemoryInputSchema = z.object({ query: z.string() });
export const searchMemoryOutputSchema = z.array(
  z.object({
    id: z.string(),
    kind: memoryKindSchema,
    title: z.string().nullable(),
    content: z.string(),
    score: z.number(),
  }),
);

export const saveMemoryInputSchema = z.object({
  kind: memoryKindSchema,
  title: z.string().optional(),
  content: z.string(),
});

export const validateContinuityInputSchema = z.object({
  text: z.string(),
  focus: z.string().optional(),
});
export const validateContinuityOutputSchema = z.object({ report: z.string() });

export const delegateSubagentInputSchema = z.object({
  role: subagentRoleSchema,
  task: z.string(),
});
export const delegateSubagentOutputSchema = z.object({
  role: subagentRoleSchema,
  result: z.string(),
});

export const editStatusResponseSchema = z.object({ status: editStatusSchema });

export type MemoryKind = z.infer<typeof memoryKindSchema>;
export type EditOperation = z.infer<typeof editOperationSchema>;
export type EditStatus = z.infer<typeof editStatusSchema>;
export type EditProposal = z.infer<typeof proposeEditOutputSchema>;
