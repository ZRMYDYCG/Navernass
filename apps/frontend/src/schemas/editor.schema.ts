import { z } from "zod";

import { editOperationSchema, editStatusSchema } from "@/schemas/agent-tool.schema";
import { chapterSchema } from "@/schemas/library.schema";

/** 后端落库的编辑操作已解析出原文中的字符区间 [start, end)。 */
export const resolvedEditOperationSchema = editOperationSchema.extend({
  start: z.number(),
  end: z.number(),
});

export const chapterEditSchema = z.object({
  id: z.string(),
  chapter_id: z.string(),
  status: editStatusSchema,
  summary: z.string(),
  base_revision: z.number(),
  operations: z.array(resolvedEditOperationSchema),
});

/** 全部未勾选时后端按拒绝处理，此时不返回章节。 */
export const applyEditResponseSchema = z.object({
  status: editStatusSchema,
  chapter: chapterSchema.optional(),
});

export type ResolvedEditOperation = z.infer<typeof resolvedEditOperationSchema>;
export type ChapterEdit = z.infer<typeof chapterEditSchema>;
