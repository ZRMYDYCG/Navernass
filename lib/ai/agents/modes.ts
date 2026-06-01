export type AiChatMode = 'ask' | 'plan' | 'outline' | 'worldbook' | 'agent'

const READ_TOOL_NAMES = [
  'read_chapter',
  'search_chapters',
  'list_volumes',
  'list_chapters',
  'list_worldbook_entries',
  'read_worldbook_entry',
  'list_outlines',
  'list_plan_files',
  'read_plan_file',
  'list_character_events',
  'list_characters',
] as const

const PLAN_TOOL_NAMES = [
  ...READ_TOOL_NAMES,
  'create_plan_file',
  'update_plan_file',
  'delete_plan_file',
  'ask_user',
] as const

const OUTLINE_TOOL_NAMES = [
  ...READ_TOOL_NAMES,
  'create_outline',
  'update_outline',
  'delete_outline',
  'ask_user',
] as const

const WORLDBOOK_TOOL_NAMES = [
  ...READ_TOOL_NAMES,
  'create_worldbook_entry',
  'update_worldbook_entry',
  'delete_worldbook_entry',
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
    agentId: 'ask-specialist',
    compatibleSkillIds: ['chinese-novel-style'],
    toolNames: ASK_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：提问 Ask】
- 你是咨询顾问，只回答、分析、给建议，**不**修改任何数据
- **禁止**调用写入/修改/删除类工具（propose_edit、create_*、update_*、delete_*、append_chapter 均不可用）
- 可以 read_* / list_* / search_* 了解现状后再作答
- 需要结构化信息时用 ask_user
- 若用户要求改稿或落库，说明请切换到「执行 Agent」或对应的规划/大纲/世界观模式`,
    maxSteps: 3,
  },
  plan: {
    id: 'plan',
    agentId: 'plan-specialist',
    compatibleSkillIds: ['chinese-novel-style', 'story-planning'],
    toolNames: PLAN_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：规划 Plan】
- **唯一落库目标**：左侧「规划」手风琴中的 Plan 文件（create_plan_file / update_plan_file）
- 用户要求梳理/整理/规划时，**必须**写入 Plan 文件；禁止只在对话里输出长文而不落库
- 先 list_plan_files / read_plan_file，再 create 或 update
- **禁止** create_outline / create_worldbook_entry / propose_edit / append_chapter 及章节卷写入删除
- 若用户要写大纲树或世界观条目，提示切换到「大纲 Outline」或「世界观 Worldbook」模式
- 需要用户确认方向时用 ask_user`,
    maxSteps: 5,
  },
  outline: {
    id: 'outline',
    agentId: 'outline-specialist',
    compatibleSkillIds: ['chinese-novel-style', 'outline-editing'],
    toolNames: OUTLINE_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：大纲 Outline】
- **唯一落库目标**：左侧「世界观」Tab →「大纲」子页的大纲树节点
- 使用 create_outline / update_outline / delete_outline；先 list_outlines 再操作
- **禁止** create_plan_file / create_worldbook_entry / propose_edit / append_chapter 及章节卷写入删除
- 若用户要写 Plan 规划笔记或世界观设定，提示切换到「规划 Plan」或「世界观 Worldbook」模式
- 需要用户确认方向时用 ask_user`,
    maxSteps: 5,
  },
  worldbook: {
    id: 'worldbook',
    agentId: 'worldbook-specialist',
    compatibleSkillIds: ['chinese-novel-style', 'worldbook-editing'],
    toolNames: WORLDBOOK_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：世界观 Worldbook】
- **唯一落库目标**：左侧「世界观」Tab →「世界观」子页的设定条目
- 使用 create_worldbook_entry / update_worldbook_entry / delete_worldbook_entry；先 list/read 再操作
- **禁止** create_plan_file / create_outline / propose_edit / append_chapter 及章节卷写入删除
- 若用户要写 Plan 规划笔记或大纲节点，提示切换到「规划 Plan」或「大纲 Outline」模式
- 需要用户确认方向时用 ask_user`,
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
- 删除类操作前必须先 list 取证
- 若用户只想整理 Plan / 大纲 / 世界观，可建议切换到对应专用模式`,
    maxSteps: 6,
  },
}

const KNOWN_MODES = new Set<AiChatMode>(['ask', 'plan', 'outline', 'worldbook', 'agent'])

export function normalizeMode(mode?: string): AiChatMode {
  if (mode && KNOWN_MODES.has(mode as AiChatMode)) {
    return mode as AiChatMode
  }
  return 'ask'
}

export function getModeConfig(mode?: string): ModeConfig {
  return MODE_CONFIGS[normalizeMode(mode)]
}

export function isToolAllowedInMode(toolName: string, mode?: string): boolean {
  const config = getModeConfig(mode)
  return (config.toolNames as readonly string[]).includes(toolName)
}
