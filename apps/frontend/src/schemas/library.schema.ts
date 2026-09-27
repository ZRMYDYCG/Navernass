import { z } from "zod";

/** 与后端 LibraryService 返回的 Prisma 行对应；只声明界面需要的字段。 */

export const novelStatusSchema = z.enum(["draft", "published", "archived"]);
export const chapterStatusSchema = z.enum(["draft", "published"]);

export const novelSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  cover: z.string().nullable(),
  word_count: z.number(),
  chapter_count: z.number(),
  status: novelStatusSchema,
});

export const volumeSchema = z.object({
  id: z.string(),
  novel_id: z.string(),
  title: z.string(),
  order_index: z.number(),
});

export const chapterSummarySchema = z.object({
  id: z.string(),
  novel_id: z.string(),
  volume_id: z.string().nullable(),
  title: z.string(),
  order_index: z.number(),
  word_count: z.number(),
  status: chapterStatusSchema,
  updated_at: z.coerce.date(),
});

export const chapterSchema = chapterSummarySchema.extend({
  content: z.string(),
  revision: z.number(),
});

export const characterFieldTypeSchema = z.enum(["text", "longText", "tags"]);

export const characterFieldSchema = z.object({
  id: z.string().max(64),
  label: z.string().max(100),
  value: z.string().max(20_000),
  type: characterFieldTypeSchema,
});

export const relationshipKindSchema = z.enum([
  "ally",
  "family",
  "romance",
  "rival",
  "enemy",
  "mentor",
  "secret",
  "custom",
]);

/** 服务端把角色存在 novel 行的 JSON 列里；这里只声明界面需要的字段。 */
export const characterProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  overview_x: z.number().nullish(),
  overview_y: z.number().nullish(),
  custom_fields: z.array(characterFieldSchema).default([]),
});

export const characterRelationshipSchema = z.object({
  id: z.string(),
  novel_id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  sourceToTargetLabel: z.string(),
  targetToSourceLabel: z.string(),
  note: z.string(),
  kind: relationshipKindSchema.default("custom"),
  strength: z.number().default(50),
  isSecret: z.boolean().default(false),
});

export const createCharacterPayloadSchema = z.object({
  novel_id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  overview_x: z.number().optional(),
  overview_y: z.number().optional(),
  custom_fields: z.array(characterFieldSchema).optional(),
});

export const updateCharacterPayloadSchema = createCharacterPayloadSchema
  .omit({ novel_id: true })
  .partial();

export const createRelationshipPayloadSchema = z.object({
  novel_id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  sourceToTargetLabel: z.string().min(1).max(100),
  targetToSourceLabel: z.string().min(1).max(100),
  note: z.string().optional(),
  kind: relationshipKindSchema.optional(),
  strength: z.number().int().min(1).max(100).optional(),
  isSecret: z.boolean().optional(),
});

export const updateRelationshipPayloadSchema = createRelationshipPayloadSchema
  .omit({ novel_id: true, sourceId: true, targetId: true })
  .partial();

export type NovelStatus = z.infer<typeof novelStatusSchema>;
export type ChapterStatus = z.infer<typeof chapterStatusSchema>;
export type Novel = z.infer<typeof novelSchema>;
export type Volume = z.infer<typeof volumeSchema>;
export type ChapterSummary = z.infer<typeof chapterSummarySchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type CharacterFieldType = z.infer<typeof characterFieldTypeSchema>;
export type CharacterField = z.infer<typeof characterFieldSchema>;
export type RelationshipKind = z.infer<typeof relationshipKindSchema>;
export type CharacterProfile = z.infer<typeof characterProfileSchema>;
export type CharacterRelationship = z.infer<typeof characterRelationshipSchema>;
export type CreateCharacterPayload = z.infer<typeof createCharacterPayloadSchema>;
export type UpdateCharacterPayload = z.infer<typeof updateCharacterPayloadSchema>;
export type CreateRelationshipPayload = z.infer<typeof createRelationshipPayloadSchema>;
export type UpdateRelationshipPayload = z.infer<typeof updateRelationshipPayloadSchema>;
