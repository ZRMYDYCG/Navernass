import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'

/**
 * delete_volume (软删除)
 *
 * 删除卷本身。注意：卷下的章节不会被一起删（保留为根章节）；如果要删整卷的章节，
 * 应该先调用 list_chapters 列出该卷的章节再逐个 delete_chapter。
 */
export const deleteVolumeTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '软删除指定卷。注意：卷下的章节不会被一起删除——它们会变成根章节。',
      '如果用户的意图是「连同卷下章节一起删」，请先用 list_chapters 确认章节列表，再用 delete_chapter 逐个删除。',
    ].join('\n'),
    inputSchema: z.object({
      volumeId: z.string().describe('要删除的卷 id'),
      reason: z.string().describe('删除原因（一句话）'),
    }),
    execute: async ({ volumeId, reason }) => {
      const service = new VolumesService(ctx.supabase)
      try {
        const before = await service.getById(volumeId)
        await service.delete(volumeId)
        return {
          ok: true,
          volume_id: volumeId,
          volume_title: before.title,
          reason,
        }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'delete_volume failed',
          hint: '可能是卷不存在或网络超时。',
        }
      }
    },
  })
}
