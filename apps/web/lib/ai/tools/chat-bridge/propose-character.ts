import type { ToolBuilder } from '../../agents/types'
import { tool } from 'ai'
import { z } from 'zod'

/**
 * propose_character — 提议把对话中提到的人物加入某本小说
 *
 * 用户点击接受后由前端调用 charactersApi.create 落库。
 */
export const proposeCharacterTool: ToolBuilder = () => {
  return tool({
    description: [
      '当用户在对话中已经讨论清楚一个角色（姓名/角色定位/性格特征/背景）并希望加入某本小说时，调用本工具。',
      '**必须**提供 novelId；如有疑问先用 ask_user 让用户挑选目标小说。',
      '执行后展示 proposal 卡片；用户接受才会真正创建。',
    ].join('\n'),
    inputSchema: z.object({
      novelId: z.string().describe('目标小说 id（必填）'),
      name: z.string().describe('角色名'),
      role: z.string().optional().describe('角色定位：主角/反派/配角/路人等'),
      description: z.string().optional().describe('角色简介 / 背景'),
      traits: z.array(z.string()).optional().describe('性格特征标签数组'),
      keywords: z.array(z.string()).optional().describe('关键词（用于全文检索）'),
    }),
    execute: async ({ novelId, name, role, description, traits, keywords }) => {
      return {
        ok: true as const,
        kind: 'propose_character' as const,
        payload: { novelId, name, role, description, traits, keywords },
      }
    },
  })
}
