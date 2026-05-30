import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { OutlinesService } from '@/lib/supabase/sdk/services/outlines.service'

/** list_outlines：列出大纲节点（可按 volume / parent 过滤） */
export const listOutlinesTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '列出当前小说的大纲节点。',
      '可选过滤：volumeId（限定某一卷下的大纲；传 null 表示全书级根大纲），parentId（限定子节点）。',
      '返回字段含完整 content（大纲通常较短，直接给）。',
    ].join('\n'),
    inputSchema: z.object({
      volumeId: z.string().nullable().optional().describe('限定某卷下的大纲；null = 全书级根大纲；不传 = 不限制'),
      parentId: z.string().nullable().optional().describe('限定父节点；null = 顶层节点；不传 = 不限制'),
    }),
    execute: async ({ volumeId, parentId }) => {
      const service = new OutlinesService(ctx.supabase)
      try {
        const list = await service.getByNovelId(ctx.novelId, { volumeId, parentId })
        return list.map((o: any) => ({
          id: o.id,
          parent_id: o.parent_id,
          volume_id: o.volume_id,
          title: o.title,
          content: o.content,
          order_index: o.order_index,
          updated_at: o.updated_at,
        }))
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'list failed' }
      }
    },
  })
}

/** create_outline：创建大纲节点 */
export const createOutlineTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '新建一个大纲节点。',
      '挂载方式：传 volumeId 把节点挂到某卷；传 parentId 把节点挂到另一节点下（形成子节点）；都不传则是全书级顶层节点。',
      '当用户说"规划一下下一卷大纲"、"列个章节大纲"、"补充某段剧情计划"时调用。',
    ].join('\n'),
    inputSchema: z.object({
      title: z.string().min(1).max(120),
      content: z.string().describe('节点正文：剧情梗概 / 场景列表 / 关键事件等'),
      volumeId: z.string().nullable().optional(),
      parentId: z.string().nullable().optional(),
    }),
    execute: async ({ title, content, volumeId, parentId }) => {
      const service = new OutlinesService(ctx.supabase)
      try {
        const created = await service.create({
          novel_id: ctx.novelId,
          title,
          content,
          volume_id: volumeId ?? null,
          parent_id: parentId ?? null,
        })
        return { ok: true, outline: created, outline_id: created.id, title: created.title }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'create failed' }
      }
    },
  })
}

/** update_outline：修改某大纲节点 */
export const updateOutlineTool: ToolBuilder = (ctx) => {
  return tool({
    description: '修改某大纲节点的标题或正文。整段替换式更新。',
    inputSchema: z.object({
      outlineId: z.string(),
      title: z.string().min(1).max(120).optional(),
      content: z.string().optional(),
      volumeId: z.string().nullable().optional(),
      parentId: z.string().nullable().optional(),
    }),
    execute: async ({ outlineId, title, content, volumeId, parentId }) => {
      const service = new OutlinesService(ctx.supabase)
      try {
        const updates: Record<string, unknown> = {}
        if (title !== undefined) updates.title = title
        if (content !== undefined) updates.content = content
        if (volumeId !== undefined) updates.volume_id = volumeId
        if (parentId !== undefined) updates.parent_id = parentId

        if (Object.keys(updates).length === 0) {
          return { ok: false, error: 'no fields to update' }
        }

        const updated = await service.update(outlineId, updates)
        return { ok: true, outline: updated, outline_id: updated.id, title: updated.title }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'update failed' }
      }
    },
  })
}

/** delete_outline：软删除某大纲节点（连同其所有子节点） */
export const deleteOutlineTool: ToolBuilder = (ctx) => {
  return tool({
    description: '软删除某大纲节点。注意：DB 上 parent_id 是 ON DELETE CASCADE 物理级联——但本工具走软删除，子节点暂不级联标记。删除前先用 list_outlines 确认。',
    inputSchema: z.object({
      outlineId: z.string(),
      reason: z.string(),
    }),
    execute: async ({ outlineId, reason }) => {
      const service = new OutlinesService(ctx.supabase)
      try {
        const before = await service.getById(outlineId)
        await service.delete(outlineId)
        return { ok: true, outline_id: outlineId, title: before.title, reason }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'delete failed' }
      }
    },
  })
}
