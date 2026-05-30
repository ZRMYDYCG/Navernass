import type { Skill } from '../agents/types'

/**
 * 编辑器手术刀 skill
 *
 * 任务：当用户要求修改/润色已写章节时，引导模型使用 propose_edit
 * 工具产出 diff，而不是直接吐 markdown。
 *
 * 触发：用户消息中包含「改」「润色」「修」「优化」「重写」等关键词
 *      或选中了具体章节（selectedChapterIds 非空）。
 */

export const editorSurgicalSkill: Skill = {
  id: 'editor-surgical',
  name: '编辑器手术刀',
  description: '用 propose_edit 工具直接在编辑器上提交修改建议',
  systemPrompt: `## 编辑器联动规则
- 当用户要求修改、润色、优化、重写**已存在的章节内容**时，必须调用 \`propose_edit\` 工具
- 不要在对话气泡中输出修改后的全文——通过 \`propose_edit\` 直接把改动作为 diff 提交到编辑器
- 调用 \`propose_edit\` 前，先用 \`read_chapter\` 拿到原文
- 一次只改一处，改动尽量小（"最小改动原则"）
- 给出的 \`reasoning\` 字段要简短说明为什么这样改（一句话）`,
  toolNames: ['read_chapter', 'propose_edit'],
  triggers: ({ text }) => {
    return /改|润色|修|优化|重写|调整|改写|polish|rewrite/i.test(text)
  },
}
