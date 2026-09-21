import { z } from "zod";

export const editOperation = z.discriminatedUnion("type", [
  z.object({
    id: z.string().trim().min(1).max(64),
    type: z.literal("replace"),
    oldText: z.string().min(1).max(100_000),
    newText: z.string().max(100_000),
    occurrence: z.number().int().min(1).max(100).default(1),
    reason: z.string().trim().min(1).max(500),
  }),
  z.object({
    id: z.string().trim().min(1).max(64),
    type: z.enum(["insert_before", "insert_after"]),
    anchor: z.string().min(1).max(20_000),
    text: z.string().min(1).max(100_000),
    occurrence: z.number().int().min(1).max(100).default(1),
    reason: z.string().trim().min(1).max(500),
  }),
  z.object({
    id: z.string().trim().min(1).max(64),
    type: z.enum(["prepend", "append"]),
    text: z.string().min(1).max(200_000),
    reason: z.string().trim().min(1).max(500),
  }),
]);

export const proposeEdit = z.object({
  chapterId: z.uuid(),
  baseRevision: z.number().int().positive(),
  summary: z.string().trim().min(1).max(500),
  operations: z
    .array(editOperation)
    .min(1)
    .max(20)
    .refine((items) => new Set(items.map((item) => item.id)).size === items.length, {
      message: "编辑操作 id 不能重复",
    }),
});

export const editParams = z.object({ id: z.uuid() });

export const editQuery = z.object({
  chapterId: z.uuid().optional(),
  status: z.enum(["pending", "applied", "rejected", "stale"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const applyEdit = z.object({
  acceptedEditIds: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
});

export const rejectEdit = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type EditOperation = z.infer<typeof editOperation>;
export type ProposeEdit = z.infer<typeof proposeEdit>;
export type ApplyEdit = z.infer<typeof applyEdit>;
export type EditQuery = z.infer<typeof editQuery>;
