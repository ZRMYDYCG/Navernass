import { z } from "zod";

export const skillManifestSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    metadata: z
      .object({
        version: z.string().optional(),
        category: z.string().optional(),
        modes: z.array(z.string()).optional(),
        resources: z.array(z.string()).optional(),
        related: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const skillSchema = z.object({
  id: z.string(),
  slug: z.string(),
  displayName: z.string(),
  description: z.string(),
  category: z.string(),
  source: z.enum(["builtin", "community", "custom"]),
  license: z.string(),
  version: z.string(),
  isBuiltin: z.boolean(),
  isCustom: z.boolean(),
  installed: z.boolean(),
  enabled: z.boolean(),
  installConfig: z.record(z.string(), z.unknown()),
  novelConfig: z.unknown().optional(),
  priority: z.number().optional(),
});

export const customSkillSchema = skillSchema.extend({
  skillMd: z.string(),
  manifest: skillManifestSchema,
});

export const createCustomSkillPayloadSchema = z.object({
  skillMd: z.string().min(1).max(100_000),
  enabled: z.boolean().default(true),
});

export const updateCustomSkillPayloadSchema = createCustomSkillPayloadSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export type Skill = z.infer<typeof skillSchema>;
export type CustomSkill = z.infer<typeof customSkillSchema>;
export type CreateCustomSkillPayload = z.infer<typeof createCustomSkillPayloadSchema>;
export type UpdateCustomSkillPayload = z.infer<typeof updateCustomSkillPayloadSchema>;
