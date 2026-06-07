/**
 * Chat 页 Agent 模式定义（独立于编辑器 modes）
 *
 * 差异：Chat 页是「创作前的自由对话」，模式按"想要 AI 帮你做什么"分类；
 * 而编辑器模式按"写到小说的哪一处"分类，需要 novelId。
 * Chat 模式不需要 novelId；桥接工具的 novelId 由模型在 tool call 时提供。
 */

export type ChatAiMode = 'ask' | 'brainstorm' | 'craft' | 'polish' | 'agent'

const ASK_TOOL_NAMES = [
  'ask_user',
] as const

const BRAINSTORM_TOOL_NAMES = [
  'ask_user',
] as const

const CRAFT_TOOL_NAMES = [
  'ask_user',
] as const

const POLISH_TOOL_NAMES = [
  'ask_user',
] as const

const AGENT_TOOL_NAMES = [
  'ask_user',
  'propose_novel',
  'propose_character',
  'propose_outline',
  'propose_summary',
] as const

export interface ChatModeConfig {
  id: ChatAiMode
  /** 注册表中的 specialist agent id */
  agentId: string
  /** 模式兼容的 skill id 白名单（router 只从中选） */
  compatibleSkillIds: string[]
  /** 模式允许的工具名 */
  toolNames: readonly string[]
  /** 注入到 system prompt 的模式说明 */
  systemPromptOverlay: string
  maxSteps: number
  /** 温度，覆盖默认值 */
  temperature?: number
}

const CHAT_MODE_CONFIGS: Record<ChatAiMode, ChatModeConfig> = {
  ask: {
    id: 'ask',
    agentId: 'chat-ask-specialist',
    compatibleSkillIds: ['chinese-novel-style'],
    toolNames: ASK_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：通用问答 Ask】
- 你是创作顾问，回答写作技法、结构分析、灵感讨论等通用问题
- 不修改任何书籍数据，不创建小说/人物/大纲
- 需要结构化信息时用 ask_user（≥2 项时）
- 简洁具体，避免空泛模板`,
    maxSteps: 3,
    temperature: 0.5,
  },
  brainstorm: {
    id: 'brainstorm',
    agentId: 'chat-brainstorm-specialist',
    compatibleSkillIds: ['chinese-novel-style', 'brainstorm-facilitation'],
    toolNames: BRAINSTORM_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：脑暴 Brainstorm】
- 大批量生成创意：情节点子、人物设定、世界观、钩子、转折
- 每条建议配 1-2 句为什么有意思（避免泛泛）
- 主动用 ask_user 让用户在三四个方向里挑一个再深挖
- 不要追求一次给出最终答案；先铺开，再收口`,
    maxSteps: 4,
  },
  craft: {
    id: 'craft',
    agentId: 'chat-craft-specialist',
    compatibleSkillIds: ['chinese-novel-style', 'craft-discussion'],
    toolNames: CRAFT_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：写作技法 Craft】
- 深入讨论 POV、节奏、对话、人物弧光、伏笔、冲突、主题等专业话题
- 给具体可执行建议（不要"建议加强人物塑造"这种空话）
- 引用知名作品时只用作例证，不剧透
- 不要长篇说教；用条目化分点回答`,
    maxSteps: 4,
  },
  polish: {
    id: 'polish',
    agentId: 'chat-polish-specialist',
    compatibleSkillIds: ['chinese-novel-style', 'polish-translate'],
    toolNames: POLISH_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：润色/翻译/改写 Polish】
- 用户粘贴文本片段时直接出改写结果
- 保留原文核心信息和语气，只在表达层面优化
- 翻译场景：保留专业术语和人名一致性
- 改写场景：先问清"更简洁 / 更文学 / 更口语"哪种风格再下手
- 输出用三反引号包裹代码块（标注是改写/翻译/润色结果）`,
    maxSteps: 3,
  },
  agent: {
    id: 'agent',
    agentId: 'chat-agent',
    compatibleSkillIds: ['chinese-novel-style'],
    toolNames: AGENT_TOOL_NAMES,
    systemPromptOverlay: `【当前模式：全量 Agent】
- 可调用 propose_novel / propose_character / propose_outline / propose_summary 桥接工具
- 用户在对话中**确认**后才落地：先调用工具展示 proposal 卡片，等用户点击接受再创建
- 不要在对话文本中直接宣称"已创建了xxx"——必须等用户接受
- 当用户想要切换到问问题/脑暴/技法讨论/润色时，主动建议切换 mode`,
    maxSteps: 5,
  },
}

const KNOWN_CHAT_MODES = new Set<ChatAiMode>(['ask', 'brainstorm', 'craft', 'polish', 'agent'])

export function normalizeChatMode(mode?: string): ChatAiMode {
  if (mode && KNOWN_CHAT_MODES.has(mode as ChatAiMode)) {
    return mode as ChatAiMode
  }
  return 'ask'
}

export function getChatModeConfig(mode?: string): ChatModeConfig {
  return CHAT_MODE_CONFIGS[normalizeChatMode(mode)]
}

export function isToolAllowedInChatMode(toolName: string, mode?: string): boolean {
  const config = getChatModeConfig(mode)
  return (config.toolNames as readonly string[]).includes(toolName)
}

export const CHAT_MODE_OPTIONS: Array<{ value: ChatAiMode, label: string }> = [
  { value: 'ask', label: 'Ask' },
  { value: 'brainstorm', label: 'Brainstorm' },
  { value: 'craft', label: 'Craft' },
  { value: 'polish', label: 'Polish' },
  { value: 'agent', label: 'Agent' },
]
