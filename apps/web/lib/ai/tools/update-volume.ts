import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'

/**
 * update_volume
 *
 * 更新卷的元信息：标题、简介、排序。返回完整 volume 对象。
 */
export const updateVolumeTool: ToolBuilder = (ctx) => {
  return tool({
    description: '更新卷的元信息（标题、简介、排序）。至少传入 title / description / orderIndex 之一。',
    inputSchema: z.object({
      volumeId: z.string().describe('要更新的卷 id'),
      title: z.string().min(1).max(80).optional().describe('新卷名'),
      description: z.string().max(500).optional().describe('新简介'),
      orderIndex: z.number().int().optional().describe('新 order_index'),
    }),
    execute: async ({ volumeId, title, description, orderIndex }) => {
      const service = new VolumesService(ctx.supabase)
      try {
        const updates: Record<string, unknown> = {}
        if (title !== undefined) updates.title = title
        if (description !== undefined) updates.description = description
        if (orderIndex !== undefined) updates.order_index = orderIndex

        if (Object.keys(updates).length === 0) {
          return { ok: false, error: 'no fields to update' }
        }

        const updated = await service.update(volumeId, updates as any)
        return {
          ok: true,
          volume: updated,
          volume_id: updated.id,
          title: updated.title,
        }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'update_volume failed',
          hint: '可能是网络超时或卷不存在；请稍后重试。',
        }
      }
    },
  })
}
