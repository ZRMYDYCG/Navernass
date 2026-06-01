import type { AgentDefinition } from './types'
import {
  writerOutlineModeSystemPrompt,
  writerPlanModeSystemPrompt,
  writerWorldbookModeSystemPrompt,
} from './writer'
import { registerAgent } from './registry'

/** Ask 模式：只读顾问 */
export const askSpecialistAgent: AgentDefinition = {
  id: 'ask-specialist',
  name: '咨询顾问',
  description: '只读分析剧情、结构、笔力；不修改任何书籍数据',
  systemPrompt: `你是一个专业的小说创作顾问。
职责：根据用户问题分析剧情走向、角色动机、结构节奏与文笔，给出可执行建议。
你**不能**修改卷章、正文、大纲、世界观或 Plan 文件——需要落库时请说明应切换到对应模式。

【工作方式】
- 先 read_* / list_* / search_* 了解现状，再作答
- 需要多项结构化信息时用 ask_user
- 回答简洁、具体，避免空泛模板

【输出语言】
中文。除工具调用外不使用 markdown。`,
  compatibleSkillIds: ['chinese-novel-style'],
}

export const planSpecialistAgent: AgentDefinition = {
  id: 'plan-specialist',
  name: '规划专员',
  description: '梳理故事弧线与章节节拍，写入 Plan 规划文件',
  systemPrompt: writerPlanModeSystemPrompt,
  compatibleSkillIds: ['chinese-novel-style', 'story-planning'],
}

export const outlineSpecialistAgent: AgentDefinition = {
  id: 'outline-specialist',
  name: '大纲专员',
  description: '维护卷/章/场景大纲树',
  systemPrompt: writerOutlineModeSystemPrompt,
  compatibleSkillIds: ['chinese-novel-style', 'outline-editing'],
}

export const worldbookSpecialistAgent: AgentDefinition = {
  id: 'worldbook-specialist',
  name: '世界观专员',
  description: '整理设定库条目，保持 lore 一致',
  systemPrompt: writerWorldbookModeSystemPrompt,
  compatibleSkillIds: ['chinese-novel-style', 'worldbook-editing'],
}

export function registerNovelSpecialistAgents() {
  registerAgent(askSpecialistAgent)
  registerAgent(planSpecialistAgent)
  registerAgent(outlineSpecialistAgent)
  registerAgent(worldbookSpecialistAgent)
}
