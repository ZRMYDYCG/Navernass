import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'

/**
 * create_volume (★ 自治创建卷)
 *
 * 当 agent 判断需要新开一卷（用户说"新建第二卷"、"开个新副本"等）时调用。
 * order_index 自动算 = 当前最大值 + 1。
 *
 * 与 propose_edit 不同：本工具会真正落库。前端通过 tool result 事件刷新左侧列表。
 */
export const createVolumeTool: ToolBuilder = (ctx) => {
  return tool({
    description: '在当前小说下创建一个新卷。order_index 由后端自动计算（追加到末尾）。',
    inputSchema: z.object({
      title: z.string().min(1).max(80).describe('卷标题，例如「第二卷·烽烟起」'),
      description: z.string().max(500).optional().describe('卷简介，可选'),
    }),
    execute: async ({ title, description }) => {
      const service = new VolumesService(ctx.supabase)
      try {
        const existing = await service.getByNovelId(ctx.novelId)
        const nextOrder = existing.length > 0
          ? Math.max(...existing.map((v: any) => v.order_index || 0)) + 1
          : 0

        const created = await service.create({
          novel_id: ctx.novelId,
          title,
          description,
          order_index: nextOrder,
        })

        return {
          ok: true,
          volume: created,
          volume_id: created.id,
          title: created.title,
          order_index: created.order_index,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'create_volume failed'
        return {
          ok: false,
          error: message,
          hint: '可能是网络超时；请稍后重试。',
        }
      }
    },
  })
}
