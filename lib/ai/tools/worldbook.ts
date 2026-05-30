import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { WorldbookEntriesService } from '@/lib/supabase/sdk/services/worldbook-entries.service'

const CATEGORY = z.enum([
  'setting',
  'location',
  'item',
  'faction',
  'event',
  'rule',
  'character_lore',
  'other',
])

/** list_worldbook_entries：列出当前小说的世界观条目元信息（不含完整正文） */
export const listWorldbookEntriesTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '列出当前小说的世界观条目（lorebook）元信息。',
      '续写情节前应先列出相关条目，避免与已有设定冲突；可按 category 过滤。',
      '返回的字段不包含完整 content（避免上下文爆炸），需要详细内容请用 read_worldbook_entry。',
    ].join('\n'),
    inputSchema: z.object({
      category: CATEGORY.optional().describe('可选；按分类过滤'),
    }),
    execute: async ({ category }) => {
      const service = new WorldbookEntriesService(ctx.supabase)
      try {
        const list = await service.getByNovelId(ctx.novelId, category)
        return list.map((e: any) => ({
          id: e.id,
          category: e.category,
          title: e.title,
          keywords: e.keywords,
          // 截短到前 80 字符做预览，完整内容用 read_worldbook_entry 拉
          preview: typeof e.content === 'string' ? e.content.slice(0, 80) : '',
          updated_at: e.updated_at,
        }))
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'list failed' }
      }
    },
  })
}

/** read_worldbook_entry：读取单个条目完整内容 */
export const readWorldbookEntryTool: ToolBuilder = (ctx) => {
  return tool({
    description: '读取指定世界观条目的完整正文（content）。当条目内容对当前续写/改稿决策关键时调用。',
    inputSchema: z.object({
      entryId: z.string().describe('条目 id'),
    }),
    execute: async ({ entryId }) => {
      const service = new WorldbookEntriesService(ctx.supabase)
      try {
        const e = await service.getById(entryId)
        return {
          ok: true,
          id: e.id,
          category: e.category,
          title: e.title,
          content: e.content,
          keywords: e.keywords,
        }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'read failed' }
      }
    },
  })
}

/** create_worldbook_entry：新建一条世界观条目 */
export const createWorldbookEntryTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '新建一条世界观条目（地点/物品/势力/事件/规则等）。',
      '当用户要求"补充世界观/添加设定/记下这个设定"时调用。',
      '内容应当结构化、自包含——这条记录将被后续的续写/改稿引用。',
    ].join('\n'),
    inputSchema: z.object({
      category: CATEGORY.describe('条目分类：setting=世界总设定，location=地点，item=物品，faction=势力，event=事件，rule=规则，character_lore=人物背景，other=其他'),
      title: z.string().min(1).max(120).describe('条目标题（如"魔导核反应堆"）'),
      content: z.string().min(1).describe('正文：清晰、自包含、单条 200-1500 字为宜'),
      keywords: z.array(z.string()).optional().describe('触发关键词；正文中出现这些词时未来可自动召回该条目'),
    }),
    execute: async ({ category, title, content, keywords }) => {
      const service = new WorldbookEntriesService(ctx.supabase)
      try {
        const created = await service.create({
          novel_id: ctx.novelId,
          category,
          title,
          content,
          keywords: keywords || [],
        })
        return {
          ok: true,
          entry: created,
          entry_id: created.id,
          title: created.title,
          category: created.category,
        }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'create failed' }
      }
    },
  })
}

/** update_worldbook_entry：修改某条目的标题/分类/正文/关键词 */
export const updateWorldbookEntryTool: ToolBuilder = (ctx) => {
  return tool({
    description: '修改某条世界观条目。修改正文是替换式（整段覆盖），不是 diff——若用户希望微调可直接给完整新版正文。',
    inputSchema: z.object({
      entryId: z.string(),
      category: CATEGORY.optional(),
      title: z.string().min(1).max(120).optional(),
      content: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }),
    execute: async ({ entryId, ...updates }) => {
      const service = new WorldbookEntriesService(ctx.supabase)
      try {
        const updated = await service.update(entryId, updates)
        return { ok: true, entry: updated, entry_id: updated.id, title: updated.title }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'update failed' }
      }
    },
  })
}

/** delete_worldbook_entry：软删除某条目 */
export const deleteWorldbookEntryTool: ToolBuilder = (ctx) => {
  return tool({
    description: '软删除一条世界观条目（可恢复）。删除前请用 list_worldbook_entries 确认 entryId。',
    inputSchema: z.object({
      entryId: z.string(),
      reason: z.string().describe('删除理由（一句话）'),
    }),
    execute: async ({ entryId, reason }) => {
      const service = new WorldbookEntriesService(ctx.supabase)
      try {
        const before = await service.getById(entryId)
        await service.delete(entryId)
        return { ok: true, entry_id: entryId, title: before.title, reason }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'delete failed' }
      }
    },
  })
}
