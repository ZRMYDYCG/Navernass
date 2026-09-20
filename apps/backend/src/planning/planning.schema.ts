import { z } from 'zod'

const uuid = z.uuid()
const base = z.object({
  novel_id: uuid,
  title: z.string().trim().min(1).max(255),
  content: z.string().max(2_000_000).default(''),
  order_index: z.number().int().min(0).default(0),
})

export const novelQuery = z.object({
  category: z.enum(['setting', 'location', 'item', 'faction', 'event', 'rule', 'character_lore', 'other']).optional(),
  volumeId: uuid.optional(),
  parentId: uuid.nullable().optional(),
})

export const createWorldbook = base.extend({
  category: z.enum(['setting', 'location', 'item', 'faction', 'event', 'rule', 'character_lore', 'other']).default('other'),
  keywords: z.array(z.string().trim().min(1).max(100)).max(100).default([]),
})
export const updateWorldbook = createWorldbook.omit({ novel_id: true }).partial()

export const createOutline = base.extend({
  volume_id: uuid.nullish(),
  parent_id: uuid.nullish(),
})
export const updateOutline = createOutline.omit({ novel_id: true }).partial()

export const createPlan = z.object({
  novel_id: uuid,
  path: z.string().trim().min(1).max(255).regex(/^[a-z0-9][a-z0-9/_-]*$/i),
  name: z.string().trim().min(1).max(255),
  content: z.string().max(2_000_000).default(''),
  order_index: z.number().int().min(0).default(0),
})
export const updatePlan = createPlan.omit({ novel_id: true }).partial()

export const createTimeline = z.object({
  novel_id: uuid,
  character_id: uuid,
  chapter_id: uuid.nullish(),
  event_type: z.enum(['appearance', 'milestone', 'relation', 'conflict', 'growth', 'death', 'other']).default('other'),
  title: z.string().trim().min(1).max(255),
  description: z.string().max(20_000).default(''),
  timeline_position: z.number().int().min(0).default(0),
  occurred_at_label: z.string().max(191).nullish(),
})
export const updateTimeline = createTimeline.omit({ novel_id: true, character_id: true }).partial()

export type CreateWorldbook = z.infer<typeof createWorldbook>
export type UpdateWorldbook = z.infer<typeof updateWorldbook>
export type CreateOutline = z.infer<typeof createOutline>
export type UpdateOutline = z.infer<typeof updateOutline>
export type CreatePlan = z.infer<typeof createPlan>
export type UpdatePlan = z.infer<typeof updatePlan>
export type CreateTimeline = z.infer<typeof createTimeline>
export type UpdateTimeline = z.infer<typeof updateTimeline>
