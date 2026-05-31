import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { toVirtualPlanPath } from '@/lib/editor/plan-path'
import { PlanFilesService } from '@/lib/supabase/sdk/services/plan-files.service'

/** list_plan_files：列出当前小说的规划文件 */
export const listPlanFilesTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '列出当前小说的 Plan 规划文件（左侧「规划」手风琴中的文档）。',
      '返回 path（虚拟路径 plan/xxx）、name、content、updated_at。',
    ].join('\n'),
    inputSchema: z.object({}),
    execute: async () => {
      const service = new PlanFilesService(ctx.supabase)
      try {
        const list = await service.getByNovelId(ctx.novelId)
        return list.map((f: { id: string, path: string, name: string, content: string, order_index: number, updated_at: string }) => ({
          id: f.id,
          path: toVirtualPlanPath(f.path),
          name: f.name,
          content: f.content,
          order_index: f.order_index,
          updated_at: f.updated_at,
        }))
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'list failed' }
      }
    },
  })
}

/** read_plan_file：读取单个规划文件 */
export const readPlanFileTool: ToolBuilder = (ctx) => {
  return tool({
    description: '读取指定 path 的 Plan 规划文件全文。path 形如 plan/main-arc 或 main-arc。',
    inputSchema: z.object({
      path: z.string().min(1).describe('规划文件路径，如 plan/vol1-beats'),
    }),
    execute: async ({ path }) => {
      const service = new PlanFilesService(ctx.supabase)
      try {
        const file = await service.getByPath(ctx.novelId, path)
        if (!file) {
          return { ok: false, error: 'plan file not found', path: toVirtualPlanPath(path) }
        }
        return {
          ok: true,
          plan_file: file,
          plan_file_id: file.id,
          path: toVirtualPlanPath(file.path),
          name: file.name,
          content: file.content,
        }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'read failed' }
      }
    },
  })
}

/** create_plan_file：新建规划文件 */
export const createPlanFileTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '新建 Plan 规划文件，写入左侧「规划」手风琴。',
      'path 为小说内唯一标识（如 plan/next-chapter-beats 或 next-chapter-beats）。',
      '用户要求整理规划、大纲笔记、章节节拍表时优先落库到此。',
    ].join('\n'),
    inputSchema: z.object({
      path: z.string().min(1).max(200).describe('唯一路径 slug，如 plan/vol2-outline'),
      name: z.string().min(1).max(120).optional().describe('显示名称，默认取 path 末段'),
      content: z.string().describe('Markdown 或纯文本正文'),
    }),
    execute: async ({ path, name, content }) => {
      const service = new PlanFilesService(ctx.supabase)
      try {
        const existing = await service.getByPath(ctx.novelId, path)
        if (existing) {
          return { ok: false, error: 'plan file already exists', plan_file_id: existing.id, path: toVirtualPlanPath(existing.path) }
        }
        const created = await service.create({
          novel_id: ctx.novelId,
          path,
          name,
          content,
        })
        return {
          ok: true,
          plan_file: created,
          plan_file_id: created.id,
          path: toVirtualPlanPath(created.path),
          name: created.name,
          title: created.name,
        }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'create failed' }
      }
    },
  })
}

/** update_plan_file：更新规划文件 */
export const updatePlanFileTool: ToolBuilder = (ctx) => {
  return tool({
    description: '更新 Plan 规划文件的 name 或 content。按 path 定位；整段替换 content。',
    inputSchema: z.object({
      path: z.string().min(1).describe('规划文件 path'),
      name: z.string().min(1).max(120).optional(),
      content: z.string().optional(),
    }),
    execute: async ({ path, name, content }) => {
      const service = new PlanFilesService(ctx.supabase)
      try {
        const file = await service.getByPath(ctx.novelId, path)
        if (!file) {
          return { ok: false, error: 'plan file not found', path: toVirtualPlanPath(path) }
        }
        const updates: Record<string, string> = {}
        if (name !== undefined) updates.name = name
        if (content !== undefined) updates.content = content
        if (Object.keys(updates).length === 0) {
          return { ok: false, error: 'no fields to update' }
        }
        const updated = await service.update(file.id, updates)
        return {
          ok: true,
          plan_file: updated,
          plan_file_id: updated.id,
          path: toVirtualPlanPath(updated.path),
          name: updated.name,
          title: updated.name,
        }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'update failed' }
      }
    },
  })
}

/** delete_plan_file：软删除规划文件 */
export const deletePlanFileTool: ToolBuilder = (ctx) => {
  return tool({
    description: '软删除指定 path 的 Plan 规划文件。删除前先用 list_plan_files 确认。',
    inputSchema: z.object({
      path: z.string().min(1),
      reason: z.string(),
    }),
    execute: async ({ path, reason }) => {
      const service = new PlanFilesService(ctx.supabase)
      try {
        const file = await service.getByPath(ctx.novelId, path)
        if (!file) {
          return { ok: false, error: 'plan file not found' }
        }
        await service.delete(file.id)
        return {
          ok: true,
          plan_file_id: file.id,
          path: toVirtualPlanPath(file.path),
          title: file.name,
          reason,
        }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'delete failed' }
      }
    },
  })
}
