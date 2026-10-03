import { z } from "zod";

export const builtinSubagentSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.string(),
});

export const customSubagentSchema = builtinSubagentSchema.extend({
  id: z.string(),
  providerId: z.string().nullable(),
  enabled: z.boolean(),
  updatedAt: z.string(),
});

export const subagentListSchema = z.object({
  builtin: z.array(builtinSubagentSchema),
  custom: z.array(customSubagentSchema),
});

export const subagentPayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/),
  description: z.string().trim().min(1).max(1024),
  instructions: z.string().trim().min(1).max(100_000),
  providerId: z.string().nullable(),
  enabled: z.boolean(),
});

export const updateSubagentPayloadSchema = subagentPayloadSchema.partial();

export type BuiltinSubagent = z.infer<typeof builtinSubagentSchema>;
export type CustomSubagent = z.infer<typeof customSubagentSchema>;
export type SubagentPayload = z.infer<typeof subagentPayloadSchema>;
export type UpdateSubagentPayload = z.infer<typeof updateSubagentPayloadSchema>;
