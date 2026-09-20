import { z } from "zod";

export const skillMode = z.enum(["ask", "plan", "outline", "worldbook", "agent"]);
export const skillIdParams = z.object({ id: z.string().trim().min(1).max(64) });
export const uuidParams = z.object({ id: z.uuid() });

export const skillQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().trim().max(64).optional(),
  source: z.enum(["builtin", "community", "custom"]).optional(),
  novelId: z.uuid().optional(),
});

export const installSkill = z.object({
  enabled: z.boolean(),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const customSkill = z.object({
  skillMd: z.string().trim().min(1).max(100_000),
  enabled: z.boolean().default(true),
});

export const updateCustomSkill = customSkill
  .partial()
  .refine((value) => Object.keys(value).length > 0, "至少提供一个更新字段");

export const novelSkill = z.object({
  skillId: z.string().trim().min(1).max(64),
  enabled: z.boolean().default(true),
  priority: z.number().int().min(-1000).max(1000).default(0),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const bindNovelSkills = z.object({
  skills: z
    .array(novelSkill)
    .max(100)
    .refine(
      (skills) => new Set(skills.map((skill) => skill.skillId)).size === skills.length,
      "skillId 不能重复",
    ),
});

export type SkillQuery = z.infer<typeof skillQuery>;
export type InstallSkill = z.infer<typeof installSkill>;
export type CustomSkill = z.infer<typeof customSkill>;
export type UpdateCustomSkill = z.infer<typeof updateCustomSkill>;
export type BindNovelSkills = z.infer<typeof bindNovelSkills>;
export type SkillMode = z.infer<typeof skillMode>;
