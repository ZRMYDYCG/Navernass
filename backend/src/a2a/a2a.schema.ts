import { z } from 'zod'
import { agentRole } from '../agent/agent.schema.js'

/** A2A Message 的 data Part 中承载的 Narraverse 执行上下文。 */
export const a2aContext = z.object({
  novelId: z.uuid(),
  chapterId: z.uuid().optional(),
  providerId: z.uuid().optional(),
  sessionId: z.uuid().optional(),
  role: agentRole.default('main'),
  maxSteps: z.number().int().min(1).max(50).optional(),
  temperature: z.number().min(0).max(2).optional(),
  context: z.record(z.string(), z.unknown()).default({}),
})

export type A2aContext = z.infer<typeof a2aContext>
