import { z } from 'zod'

export const uuidSchema = z.uuid()
export const idParams = z.object({ id: uuidSchema })
export const novelParams = z.object({ id: uuidSchema })

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export const createNovel = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(20_000).optional(),
  cover: z.url().or(z.literal('')).optional(),
  category: z.string().trim().max(100).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
})

export const updateNovel = createNovel.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export const orderItems = z.array(z.object({
  id: uuidSchema,
  order_index: z.number().int().min(0),
})).min(1).max(500)

export const createVolume = z.object({
  novel_id: uuidSchema,
  title: z.string().trim().min(1).max(255),
  description: z.string().max(20_000).optional(),
  order_index: z.number().int().min(0).default(0),
})

export const updateVolume = createVolume.omit({ novel_id: true }).partial()

export const createChapter = z.object({
  novel_id: uuidSchema,
  volume_id: uuidSchema.nullish(),
  title: z.string().trim().min(1).max(255),
  content: z.string().max(5_000_000).default(''),
  order_index: z.number().int().min(0).default(0),
})

export const updateChapter = createChapter.omit({ novel_id: true }).partial().extend({
  status: z.enum(['draft', 'published']).optional(),
})

export const chapterSearch = z.object({
  novelId: uuidSchema,
  keyword: z.string().trim().min(1).max(100),
  volumeId: uuidSchema.nullable().optional(),
  excludeVolumeId: uuidSchema.nullable().optional(),
})

export const createCharacter = z.object({
  novel_id: uuidSchema,
  name: z.string().trim().min(1).max(100),
  role: z.string().max(100).default(''),
  avatar: z.string().max(2_000).default(''),
  color: z.string().max(32).nullable().optional(),
  description: z.string().max(20_000).default(''),
  traits: z.array(z.string().max(100)).max(100).default([]),
  keywords: z.array(z.string().max(100)).max(100).default([]),
  first_appearance: z.string().max(255).default(''),
  note: z.string().max(20_000).default(''),
  order_index: z.number().int().min(0).optional(),
  overview_x: z.number().finite().nullable().optional(),
  overview_y: z.number().finite().nullable().optional(),
})

export const updateCharacter = createCharacter.omit({ novel_id: true }).partial()

const relationshipFields = z.object({
  novel_id: uuidSchema,
  sourceId: uuidSchema,
  targetId: uuidSchema,
  sourceToTargetLabel: z.string().trim().min(1).max(100),
  targetToSourceLabel: z.string().trim().min(1).max(100),
  note: z.string().max(20_000).default(''),
})

export const createRelationship = relationshipFields.refine(value => value.sourceId !== value.targetId, {
  message: '关系双方不能是同一个角色',
  path: ['targetId'],
})

export const updateRelationship = relationshipFields.omit({ novel_id: true }).partial().refine(
  value => !value.sourceId || !value.targetId || value.sourceId !== value.targetId,
  { message: '关系双方不能是同一个角色', path: ['targetId'] },
)

export type CreateNovelInput = z.infer<typeof createNovel>
export type UpdateNovelInput = z.infer<typeof updateNovel>
export type CreateVolumeInput = z.infer<typeof createVolume>
export type UpdateVolumeInput = z.infer<typeof updateVolume>
export type CreateChapterInput = z.infer<typeof createChapter>
export type UpdateChapterInput = z.infer<typeof updateChapter>
export type CreateCharacterInput = z.infer<typeof createCharacter>
export type UpdateCharacterInput = z.infer<typeof updateCharacter>
export type CreateRelationshipInput = z.infer<typeof createRelationship>
export type UpdateRelationshipInput = z.infer<typeof updateRelationship>
