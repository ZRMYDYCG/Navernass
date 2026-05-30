import type { Skill } from '../agents/types'

/**
 * 中文长篇小说基础风格 skill
 *
 * 任务：保证文笔自然、AABB 化、避免翻译腔与口水话。
 * 适用：Writer agent 的所有续写/扩写任务。
 */
export const chineseNovelStyleSkill: Skill = {
  id: 'chinese-novel-style',
  name: '中文小说风格',
  description: '中文长篇小说的基础文笔与节奏要求',
  systemPrompt: `## 风格要求
- 使用流畅的中文长篇小说叙述节奏，避免翻译腔与口水话
- 多用具象细节（动作、五感、环境），少用抽象形容词堆叠
- 单段不要超过 4-5 行，对话与叙述穿插推进
- 不要复述用户已经写过的剧情，只续写或润色用户指定的部分
- 保持人称、时态与原文一致`,
}
