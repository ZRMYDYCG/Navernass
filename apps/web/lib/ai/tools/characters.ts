import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { CharactersService } from '@/lib/supabase/sdk/services/characters.service'
import { RelationshipsService } from '@/lib/supabase/sdk/services/relationships.service'

const CHARACTER_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

function pickColor(index: number) {
  return CHARACTER_COLORS[index % CHARACTER_COLORS.length]
}

/** 列出当前小说已有角色（导入分析时避免重复创建） */
export const listCharactersTool: ToolBuilder = (ctx) => {
  return tool({
    description: '列出当前小说已有的角色列表，导入分析前先调用以避免重复创建。',
    inputSchema: z.object({}),
    execute: async () => {
      const service = new CharactersService(ctx.supabase)
      try {
        const characters = await service.getByNovelId(ctx.novelId)
        return {
          ok: true,
          characters: (characters as Array<{ id: string, name: string, role?: string }>).map(c => ({
            id: c.id,
            name: c.name,
            role: c.role || '',
          })),
          count: characters.length,
        }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'list_characters failed',
        }
      }
    },
  })
}

/** 报告分析步骤进度（AG-UI 可见的执行步骤） */
export const reportAnalysisStepTool: ToolBuilder = () => {
  return tool({
    description: [
      '报告当前分析步骤的进度，让用户看到 Agent 正在做什么。',
      '每个主要阶段开始前必须调用一次：阅读文本 → 识别角色 → 分析关系 → 完成。',
    ].join('\n'),
    inputSchema: z.object({
      step: z.enum(['reading', 'identifying', 'creating_characters', 'analyzing_relationships', 'complete']).describe('步骤类型'),
      title: z.string().min(1).max(60).describe('步骤标题，如「正在识别主要角色」'),
      detail: z.string().max(500).optional().describe('步骤详情或发现摘要'),
    }),
    execute: async ({ step, title, detail }) => ({
      ok: true,
      step,
      title,
      detail: detail || '',
    }),
  })
}

/** 创建角色并写入小说角色库 */
export const createCharacterTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '在当前小说中创建一个新角色。',
      'name 用正式名称；aliases 存别名/称呼；role 如主角/配角/龙套。',
      '创建前应用 list_characters 确认不存在同名角色。',
    ].join('\n'),
    inputSchema: z.object({
      name: z.string().min(1).max(40).describe('角色正式名称'),
      role: z.string().max(20).optional().describe('角色定位：主角/配角/龙套等'),
      description: z.string().max(500).optional().describe('角色简介'),
      traits: z.array(z.string().max(30)).max(8).optional().describe('性格特点'),
      aliases: z.array(z.string().max(30)).max(6).optional().describe('别名、昵称、称呼'),
      first_appearance: z.string().max(120).optional().describe('首次登场描述'),
    }),
    execute: async ({ name, role, description, traits, aliases, first_appearance }) => {
      try {
        const { data: novel, error } = await ctx.supabase
          .from('novels')
          .select('characters')
          .eq('id', ctx.novelId)
          .single()

        if (error) throw error

        const list: unknown[] = Array.isArray((novel as { characters?: unknown }).characters)
          ? (novel as { characters: unknown[] }).characters
          : []

        const normalizedName = name.trim()
        const existing = list.find((item) => {
          const c = item as { name?: string }
          return (c.name || '').trim() === normalizedName
        }) as { id: string, name: string } | undefined

        if (existing) {
          return {
            ok: true,
            skipped: true,
            character: existing,
            name: existing.name,
            hint: '角色已存在，跳过创建',
          }
        }

        const id = globalThis.crypto?.randomUUID?.() ?? uuidv4()
        const keywords = aliases?.map(a => a.trim()).filter(Boolean) ?? []

        const newCharacter = {
          id,
          novel_id: ctx.novelId,
          name: normalizedName,
          role: role || '',
          avatar: '',
          color: pickColor(list.length),
          description: description || '',
          traits: traits ?? [],
          keywords,
          first_appearance: first_appearance || '',
          note: '',
          order_index: list.length,
          overview_x: null,
          overview_y: null,
        }

        const { error: updateError } = await ctx.supabase
          .from('novels')
          .update({ characters: [...list, newCharacter] })
          .eq('id', ctx.novelId)

        if (updateError) throw updateError

        return {
          ok: true,
          skipped: false,
          character: newCharacter,
          name: newCharacter.name,
          role: newCharacter.role,
        }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'create_character failed',
        }
      }
    },
  })
}

/** 创建角色间关系 */
export const createRelationshipTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '在两个角色之间创建双向关系。',
      'sourceCharacterId / targetCharacterId 必须是 create_character 返回的 id 或 list_characters 中的 id。',
      '标签要简洁，如「父亲→儿子」「师父→徒弟」。',
    ].join('\n'),
    inputSchema: z.object({
      sourceCharacterId: z.string().min(1).describe('源角色 id'),
      targetCharacterId: z.string().min(1).describe('目标角色 id'),
      sourceToTargetLabel: z.string().min(1).max(30).describe('源→目标关系标签，如「父亲」'),
      targetToSourceLabel: z.string().min(1).max(30).describe('目标→源关系标签，如「儿子」'),
      note: z.string().max(200).optional().describe('关系备注'),
    }),
    execute: async ({ sourceCharacterId, targetCharacterId, sourceToTargetLabel, targetToSourceLabel, note }) => {
      if (sourceCharacterId === targetCharacterId) {
        return { ok: false, error: '不能创建自身关系' }
      }

      try {
        const service = new RelationshipsService(ctx.supabase)
        const current = await service.getByNovelId(ctx.novelId)

        const exists = current.some(rel =>
          (rel.sourceId === sourceCharacterId && rel.targetId === targetCharacterId)
          || (rel.sourceId === targetCharacterId && rel.targetId === sourceCharacterId),
        )
        if (exists) {
          return { ok: true, skipped: true, hint: '关系已存在，跳过' }
        }

        const newRelationship = {
          id: uuidv4(),
          novel_id: ctx.novelId,
          sourceId: sourceCharacterId,
          targetId: targetCharacterId,
          sourceToTargetLabel,
          targetToSourceLabel,
          note: note ?? '',
        }

        const { error: updateErr } = await ctx.supabase
          .from('novels')
          .update({ relationships: [...current, newRelationship] })
          .eq('id', ctx.novelId)

        if (updateErr) throw updateErr

        return {
          ok: true,
          skipped: false,
          relationship: newRelationship,
          sourceToTargetLabel,
          targetToSourceLabel,
        }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'create_relationship failed',
        }
      }
    },
  })
}
