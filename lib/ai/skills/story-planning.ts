import type { Skill } from '../agents/types'

/**
 * 故事规划 skill — 仅在 Plan 模式启用
 */
export const storyPlanningSkill: Skill = {
  id: 'story-planning',
  name: '故事规划',
  description: '梳理大纲、章节节奏与世界观设定',
  systemPrompt: `## 规划模式规则
- 输出侧重：故事弧线、章节节拍、伏笔布局、角色动机与世界观一致性
- 讨论「接下来怎么写」时，优先 create_outline / update_outline 把规划落档
- 新设定（地名、势力、规则）用 create_worldbook_entry 记录，避免口头约定
- 不要输出大段正文续写；如需示例，控制在 2-3 句说明写法即可
- 规划完成后简要总结已落库条目，方便用户核对`,
  triggers: ({ mode }) => mode === 'plan',
}
