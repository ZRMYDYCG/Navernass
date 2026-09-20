import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { VolumesService } from '@/lib/supabase/sdk/services/volumes.service'

/**
 * list_volumes
 *
 * 列出当前小说所有卷（按 order_index 排序）。
 * Agent 在创建章节前可以先调用本工具查询卷结构，决定挂在哪一卷下。
 */
export const listVolumesTool: ToolBuilder = (ctx) => {
  return tool({
    description: '列出当前小说的所有卷。Agent 创建章节前可调用此工具确认卷结构。',
    inputSchema: z.object({}),
    execute: async () => {
      const service = new VolumesService(ctx.supabase)
      const volumes = await service.getByNovelId(ctx.novelId)
      return volumes.map((v: any) => ({
        id: v.id,
        title: v.title,
        description: v.description || '',
        order_index: v.order_index,
      }))
    },
  })
}
