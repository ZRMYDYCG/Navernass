import type { ToolBuilder } from '../../agents/types'
import { tool } from 'ai'
import { z } from 'zod'

/**
 * propose_outline — 提议把对话中的大纲节点加入某本小说
 */
export const proposeOutlineTool: ToolBuilder = () => {
  return tool({
    description: [
      '当用户在对话中已经讨论清楚一个大纲节点（卷/章/场景级）并希望加入某本小说时，调用本工具。',
      '**必须**提供 novelId；如有疑问先用 ask_user 让用户挑选目标小说。',
      '执行后展示 proposal 卡片；用户接受才会真正创建。',
    ].join('\n'),
    inputSchema: z.object({
      novelId: z.string().describe('目标小说 id（必填）'),
      title: z.string().describe('大纲节点标题'),
      content: z.string().optional().describe('大纲内容 / 描述'),
      volumeId: z.string().optional().describe('归属卷 id（可选，跨卷/章级填 null）'),
      parentId: z.string().optional().describe('父级大纲节点 id（可选）'),
    }),
    execute: async ({ novelId, title, content, volumeId, parentId }) => {
      return {
        ok: true as const,
        kind: 'propose_outline' as const,
        payload: { novelId, title, content, volumeId, parentId },
      }
    },
  })
}
