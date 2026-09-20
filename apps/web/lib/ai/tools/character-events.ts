import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { CharacterTimelineEventsService } from '@/lib/supabase/sdk/services/character-timeline-events.service'

const EVENT_TYPE = z.enum([
  'appearance',
  'milestone',
  'relation',
  'conflict',
  'growth',
  'death',
  'other',
])

/** list_character_events：列某角色的时间线事件 */
export const listCharacterEventsTool: ToolBuilder = (ctx) => {
  return tool({
    description: '列出某角色的全部时间线事件（按 timeline_position 排序）。在为该角色构思新事件 / 修改剧情线之前先调用，避免与已有节点冲突。',
    inputSchema: z.object({
      characterId: z.string().describe('角色 id'),
    }),
    execute: async ({ characterId }) => {
      const service = new CharacterTimelineEventsService(ctx.supabase)
      try {
        const list = await service.getByCharacterId(characterId)
        return list.map((e: any) => ({
          id: e.id,
          event_type: e.event_type,
          title: e.title,
          description: e.description,
          chapter_id: e.chapter_id,
          timeline_position: e.timeline_position,
          occurred_at_label: e.occurred_at_label,
          updated_at: e.updated_at,
        }))
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'list failed' }
      }
    },
  })
}

/** create_character_event：为角色添加时间线事件 */
export const createCharacterEventTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '为某角色新增一条时间线事件。',
      '当用户希望"为角色添加一段经历"、"在剧情中加入一个里程碑"、"记下角色的关键转折"时调用。',
      'event_type：登场/里程碑/关系/冲突/成长/死亡/其他。',
      '可选 chapterId 关联到某章节；occurred_at_label 是故事内时间标签（如"第三年春"）。',
    ].join('\n'),
    inputSchema: z.object({
      characterId: z.string(),
      eventType: EVENT_TYPE.describe('事件类型'),
      title: z.string().min(1).max(120),
      description: z.string().describe('事件详情，2-4 句为宜'),
      chapterId: z.string().nullable().optional(),
      occurredAtLabel: z.string().nullable().optional().describe('故事内时间标签'),
    }),
    execute: async ({ characterId, eventType, title, description, chapterId, occurredAtLabel }) => {
      const service = new CharacterTimelineEventsService(ctx.supabase)
      try {
        const created = await service.create({
          novel_id: ctx.novelId,
          character_id: characterId,
          event_type: eventType,
          title,
          description,
          chapter_id: chapterId ?? null,
          occurred_at_label: occurredAtLabel ?? null,
        })
        return { ok: true, event: created, event_id: created.id, title: created.title }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'create failed' }
      }
    },
  })
}

/** update_character_event */
export const updateCharacterEventTool: ToolBuilder = (ctx) => {
  return tool({
    description: '修改某条时间线事件。整段替换式更新；不传的字段保持不变。',
    inputSchema: z.object({
      eventId: z.string(),
      eventType: EVENT_TYPE.optional(),
      title: z.string().min(1).max(120).optional(),
      description: z.string().optional(),
      chapterId: z.string().nullable().optional(),
      occurredAtLabel: z.string().nullable().optional(),
      timelinePosition: z.number().int().optional().describe('调整在时间线上的位置'),
    }),
    execute: async ({ eventId, eventType, title, description, chapterId, occurredAtLabel, timelinePosition }) => {
      const service = new CharacterTimelineEventsService(ctx.supabase)
      try {
        const updates: Record<string, unknown> = {}
        if (eventType !== undefined) updates.event_type = eventType
        if (title !== undefined) updates.title = title
        if (description !== undefined) updates.description = description
        if (chapterId !== undefined) updates.chapter_id = chapterId
        if (occurredAtLabel !== undefined) updates.occurred_at_label = occurredAtLabel
        if (timelinePosition !== undefined) updates.timeline_position = timelinePosition
        if (Object.keys(updates).length === 0) {
          return { ok: false, error: 'no fields to update' }
        }
        const updated = await service.update(eventId, updates as any)
        return { ok: true, event: updated, event_id: updated.id, title: updated.title }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'update failed' }
      }
    },
  })
}

/** delete_character_event */
export const deleteCharacterEventTool: ToolBuilder = (ctx) => {
  return tool({
    description: '软删除一条时间线事件。删除前请先 list_character_events 确认 eventId。',
    inputSchema: z.object({
      eventId: z.string(),
      reason: z.string(),
    }),
    execute: async ({ eventId, reason }) => {
      const service = new CharacterTimelineEventsService(ctx.supabase)
      try {
        const before = await service.getById(eventId)
        await service.delete(eventId)
        return { ok: true, event_id: eventId, title: before.title, reason }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'delete failed' }
      }
    },
  })
}
