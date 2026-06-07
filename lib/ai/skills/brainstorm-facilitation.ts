import type { Skill } from '../agents/types'

/**
 * 脑暴引导 skill
 *
 * 任务：让模型铺开而非收敛，先大量抛点子再收口。
 * 触发：用户消息含"想/构思/脑暴/灵感/点子/创意"等词，或 brainstorm mode。
 */
export const brainstormFacilitationSkill: Skill = {
  id: 'brainstorm-facilitation',
  name: '脑暴引导',
  description: '先铺开再收口：批量抛点子，3-5 个不同方向',
  systemPrompt: `## 脑暴引导规则
- **铺开优先**：一次给 3-5 个不同方向/角度的方案，不要急着收敛到"最佳答案"
- 每条点子配 1-2 句"为什么有意思"或"反差点在哪"
- 避免泛泛标签（"悬疑""爱情"）——要写到具体场景/冲突/钩子层面
- 在用户挑出方向后**才**深挖细节；没挑之前不要替用户做选择
- 用 ask_user 给出 2-4 个互斥方向让用户挑，比让用户自己描述更高效`,
  triggers: ({ text, mode }) => {
    if (mode === 'brainstorm') return true
    return /脑暴|头脑风暴|点子|灵感|构思|创意|开脑洞|想一个|想几个/i.test(text)
  },
}
