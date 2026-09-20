import type { ToolBuilder } from '../../agents/types'
import { tool } from 'ai'
import { z } from 'zod'

/**
 * propose_novel — 从对话内容中提议创建一本新小说
 *
 * execute 仅返回 payload 供前端展示 proposal 卡片;
 * 用户点击「接受」时由前端调用 novelsApi.create 完成实际落库。
 */
export const proposeNovelTool: ToolBuilder = () => {
  return tool({
    description: [
      '当用户在对话中已经讨论清楚一本新小说的核心设定（书名/类型/简介/标签/目标读者等）时，调用本工具向用户提议「创建一本新小说」。',
      '执行后会向用户展示一张接受/拒绝的卡片；用户接受才会真正创建。',
      '不要在对话中直接宣称"已创建"，必须等用户接受。',
    ].join('\n'),
    inputSchema: z.object({
      title: z.string().describe('书名（≤ 30 字）'),
      description: z.string().optional().describe('简介 / 一句话卖点'),
      category: z.string().optional().describe('类型 / 题材（悬疑/言情/科幻等）'),
      tags: z.array(z.string()).optional().describe('标签数组'),
      summary: z.string().optional().describe('基于对话内容整理的故事摘要（≤ 500 字）'),
    }),
    execute: async ({ title, description, category, tags, summary }) => {
      return {
        ok: true as const,
        kind: 'propose_novel' as const,
        payload: { title, description, category, tags, summary },
      }
    },
  })
}
