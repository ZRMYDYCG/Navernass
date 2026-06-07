import type { Skill } from '../agents/types'

/**
 * 写作技法讨论 skill
 *
 * 任务：把"如何写"的话题拆成可执行的具体建议。
 * 触发：用户在 craft mode，或询问 POV/节奏/对话/弧光等技法话题。
 */
export const craftDiscussionSkill: Skill = {
  id: 'craft-discussion',
  name: '写作技法讨论',
  description: '把写作技法拆成具体可执行的建议',
  systemPrompt: `## 写作技法讨论规则
- 回答时区分「原理」和「操作步骤」——读者要的是"明天能怎么改"
- 引用知名作品只用做例证，**不剧透**
- 多用对比（第一人称 vs 第三人称紧贴 / 顺叙 vs 倒叙）让用户感知差异
- 给具体句子级别示范（不要只讲"加强对话"，要给改写前后对比）
- 涉及"什么算好"时承认流派差异，避免单一标准的训诫口吻`,
  triggers: ({ text, mode }) => {
    if (mode === 'craft') return true
    return /POV|视角|节奏|对话|弧光|伏笔|冲突|主题|文笔|技法|第一人称|第三人称/i.test(text)
  },
}
