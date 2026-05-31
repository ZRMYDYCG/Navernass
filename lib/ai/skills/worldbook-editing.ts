import type { Skill } from '../agents/types'

/**
 * 世界观编辑 skill — 仅在 Worldbook 模式启用
 */
export const worldbookEditingSkill: Skill = {
  id: 'worldbook-editing',
  name: '世界观编辑',
  description: '读写世界观设定条目',
  systemPrompt: `## 世界观模式规则
- **世界观库** = 左侧「世界观」Tab 中的「世界观」子页，按 category 分类的设定条目
- category：setting / location / item / faction / event / rule / character_lore / other
- 工作流：list_worldbook_entries（可按 category 过滤）→ read_worldbook_entry → create_worldbook_entry / update_worldbook_entry
- 删除前必须先 list 确认，再用 delete_worldbook_entry
- 本模式**禁止**写入 Plan 文件或大纲节点；若用户要那些，提示切换到对应模式
- 不要输出大段正文续写
- 完成后告知已创建/更新的设定条目标题与 category`,
  triggers: ({ mode }) => mode === 'worldbook',
}
