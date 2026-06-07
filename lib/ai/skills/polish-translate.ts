import type { Skill } from '../agents/types'

/**
 * 润色/翻译 skill
 *
 * 任务：保留原文核心信息和语气，只在表达层面优化。
 * 触发：用户粘贴文本片段，或显式说"润色/翻译/改写"。
 */
export const polishTranslateSkill: Skill = {
  id: 'polish-translate',
  name: '润色与翻译',
  description: '保留原文信息，优化表达与可读性',
  systemPrompt: `## 润色/翻译/改写规则
- **保留**原文核心信息、人物名、地名、专有名词一致性
- **保留**原文语气（幽默/严肃/抒情等），只在表达层面优化
- 改写时先确认目标风格（更简洁 / 更文学 / 更口语 / 更古风）
- 翻译时保留专业术语原文 + 首次出现加注
- 输出用 \`\`\`markdown 代码块包裹，标注「改写 / 翻译 / 润色」
- 不要复述或点评原文，直接给结果`,
  triggers: ({ text, mode }) => {
    if (mode === 'polish') return true
    return /润色|翻译|改写|优化文案|重写这句|polish|rewrite|translate/i.test(text)
  },
}
