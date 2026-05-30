export type AiChatMode = 'ask' | 'plan' | 'agent'

const READ_TOOL_NAMES = [
  'read_chapter',
  'search_chapters',
  'list_volumes',
  'list_chapters',
  'list_worldbook_entries',
  'read_worldbook_entry',
  'list_outlines',
  'list_character_events',
  'list_characters',
] as const

const PLAN_TOOL_NAMES = [
  ...READ_TOOL_NAMES,
  'create_worldbook_entry',
  'update_worldbook_entry',
  'delete_worldbook_entry',
  'create_outline',
  'update_outline',
  'delete_outline',
  'ask_user',
] as const

const ASK_TOOL_NAMES = [
  ...READ_TOOL_NAMES,
  'ask_user',
] as const

/** Writer agent 全量工具列表（与 writer.ts defaultToolNames 保持一致） */
export const WRITER_DEFAULT_TOOL_NAMES = [
  'read_chapter',
  'search_chapters',
  'list_volumes',
  'list_chapters',
  'list_worldbook_entries',
  'read_worldbook_entry',
  'list_outlines',
  'propose_edit',
  'create_volume',
  'create_chapter',
  'append_chapter',
  'create_worldbook_entry',
  'create_outline',
  'update_chapter',
  'update_volume',
  'update_worldbook_entry',
  'update_outline',
  'delete_chapter',
  'delete_volume',
  'delete_worldbook_entry',
  'delete_outline',
  'ask_user',
] as const

export interface ModeConfig {
  id: AiChatMode
  agentId: string
  /** skill 白名单（router 只从中选） */
  compatibleSkillIds: string[]
  toolNames: readonly string[]
  systemPromptOverlay: string
  maxSteps: number
}

const MODE_CONFIGS: Record<AiChatMode, ModeConfig> = {
  ask: {
    id: 'ask',
    agentId: 'writer',
    compatibleSkillIds: ['chinese-novel-style'],
    toolNames: ASK_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：提问 Ask】
- 你是咨询顾问，只回答、分析、给建议，**不**修改任何数据
- **禁止**调用写入/修改/删除类工具（propose_edit、create_*、update_*、delete_*、append_chapter 均不可用）
- 可以 read_* / list_* / search_* 了解现状后再作答
- 需要结构化信息时用 ask_user
- 若用户要求改稿或落库，说明请切换到「执行 Agent」模式`,
    maxSteps: 3,
  },
  plan: {
    id: 'plan',
    agentId: 'writer',
    compatibleSkillIds: ['chinese-novel-style', 'story-planning'],
    toolNames: PLAN_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：规划 Plan】
- 专注故事结构、章节安排、世界观与大纲，**不**直接改正文
- **禁止** propose_edit、append_chapter、create_chapter、update_chapter、create_volume、update_volume 及所有 delete_* 章节/卷工具
- 可读写世界观条目与大纲节点（create/update worldbook、outline）
- 先 list/read 再规划；规划结果优先落库到 outline / worldbook
- 需要用户确认方向时用 ask_user
- 若用户要求直接改稿或续写，说明请切换到「执行 Agent」模式`,
    maxSteps: 5,
  },
  agent: {
    id: 'agent',
    agentId: 'writer',
    compatibleSkillIds: ['chinese-novel-style', 'editor-surgical'],
    toolNames: WRITER_DEFAULT_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：执行 Agent】
- 可自主读档、续写、润色、改稿，并管理卷/章节/设定/大纲
- 修改已有正文时优先 propose_edit（最小改动）；续写用 append_chapter
- 删除类操作前必须先 list 取证`,
    maxSteps: 6,
  },
}

export function normalizeMode(mode?: string): AiChatMode {
  if (mode === 'plan' || mode === 'agent') return mode
  return 'ask'
}

export function getModeConfig(mode?: string): ModeConfig {
  return MODE_CONFIGS[normalizeMode(mode)]
}

export function isToolAllowedInMode(toolName: string, mode?: string): boolean {
  const config = getModeConfig(mode)
  return config.toolNames.includes(toolName)
}
