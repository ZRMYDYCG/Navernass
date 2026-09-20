import { z } from 'zod'

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const newsQuery = pageQuery.extend({
  type: z.enum(['feature', 'update', 'announcement', 'community']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export const createNews = z.object({
  type: z.enum(['feature', 'update', 'announcement', 'community']),
  title: z.string().trim().min(1).max(255),
  content: z.string().min(1).max(2_000_000),
  image: z.string().max(2_000).optional(),
  link: z.string().max(2_000).optional(),
  author: z.string().max(191).optional(),
  priority: z.number().int().min(0).default(0),
})
export const updateNews = createNews.partial().extend({ status: z.enum(['draft', 'published', 'archived']).optional() })

export const createSurvey = z.object({
  experience: z.string().trim().min(1).max(191),
  genres: z.array(z.string().max(100)).min(1).max(50),
  pain_points: z.array(z.string().max(200)).max(50).default([]),
  tools: z.array(z.string().max(100)).max(50).default([]),
  ai_expectations: z.array(z.string().max(200)).max(50).default([]),
  ai_concerns: z.string().max(10_000).optional(),
  contact: z.string().max(255).optional(),
})

export const createTodo = z.object({
  content: z.string().trim().min(1).max(2_000),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})
export const updateTodo = createTodo.partial().extend({ id: z.uuid(), completed: z.boolean().optional() })

export const createWall = z.object({
  nickname: z.string().trim().max(64).optional(),
  message: z.string().trim().min(1).max(180),
})

export type CreateNews = z.infer<typeof createNews>
export type UpdateNews = z.infer<typeof updateNews>
export type CreateSurvey = z.infer<typeof createSurvey>
export type CreateTodo = z.infer<typeof createTodo>
export type UpdateTodo = z.infer<typeof updateTodo>
export type CreateWall = z.infer<typeof createWall>
