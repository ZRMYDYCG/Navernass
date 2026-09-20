import { z } from 'zod'

export const adminQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().max(32).optional(),
})

export const deleteQuery = z.object({ id: z.uuid() })

export const resourceParam = z.object({
  resource: z.enum([
    'users', 'profiles', 'novels', 'chapters', 'volumes', 'surveys', 'news',
    'message-wall', 'writer-todos', 'plan-files', 'worldbook', 'outlines', 'timeline-events',
  ]),
})

export type AdminResource = z.infer<typeof resourceParam>['resource']
