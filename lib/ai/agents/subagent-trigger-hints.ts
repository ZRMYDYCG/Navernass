import type { AiChatMode } from './modes'

export type SubagentTriggerKind
  = | 'deep_research'
    | 'delegate_character_timeline'
    | 'run_parallel_subagents'

const PARALLEL_CUE_RE = /同时|并且|以及|顺便|一并|并行|还要|还要把/

export interface SubagentTriggerOptions {
  hasFocusCharacter?: boolean
  focusCharacterName?: string
}

const TIMELINE_RE
  = /时间线|龙套|路人|配角|character_event|角色事件|里程碑|登场|成长弧|关系变化|纳课本|写入.*角色|写进.*章/i

const TIMELINE_WITH_FOCUS_RE
  = /继续|上面|刚才|第三章|第二章|第一章|第\d+章|帮([我他她])|补充|整理|名字/

const RESEARCH_RE
  = /调研|核对|矛盾|多章|前文|设定是否|整理.*摘要|通读|对比.*设定|是否一致/

const RESEARCH_WRITE_RE = /续写|改稿|大改|重写/

const MULTI_SCOPE_RE = /多章|全文|第三卷|第二卷|第一卷|整卷|各章|前几章/

/**
 * 根据用户输入判断是否应委派子 Agent（仅启发式，供 system hint 使用）。
 */
export function detectSubagentTrigger(
  text: string,
  options?: SubagentTriggerOptions,
): SubagentTriggerKind | null {
  const t = text.trim()
  if (!t) return null

  const wantsTimeline = TIMELINE_RE.test(t)
    || (Boolean(options?.hasFocusCharacter) && TIMELINE_WITH_FOCUS_RE.test(t))
  const wantsResearch = RESEARCH_RE.test(t)
    || (RESEARCH_WRITE_RE.test(t) && MULTI_SCOPE_RE.test(t))

  if (wantsTimeline && wantsResearch && (PARALLEL_CUE_RE.test(t) || options?.hasFocusCharacter)) {
    return 'run_parallel_subagents'
  }

  if (options?.hasFocusCharacter) {
    if (/^@[^\s@]+(\s+@[^\s@]+)*$/.test(t)) {
      return 'delegate_character_timeline'
    }
    if (wantsTimeline || TIMELINE_WITH_FOCUS_RE.test(t)) {
      return 'delegate_character_timeline'
    }
  }

  if (wantsTimeline && /角色|时间线|龙套|@/.test(t)) {
    return 'delegate_character_timeline'
  }

  if (wantsResearch) return 'deep_research'

  return null
}

/**
 * 执行模式下注入「必须调用子 Agent 工具」的 system 片段。
 */
export function buildSubagentTriggerHint(
  text: string,
  mode: AiChatMode | string,
  options?: SubagentTriggerOptions,
): string | null {
  if (mode !== 'agent') return null

  const kind = detectSubagentTrigger(text, options)
  if (!kind) return null

  if (kind === 'run_parallel_subagents') {
    const who = options?.focusCharacterName
      ? `characterName="${options.focusCharacterName}"，`
      : ''
    return [
      '【子 Agent 并行委派 — 本回合必做】',
      '用户同时需要跨设定调研与角色时间线维护，且任务互不依赖。',
      '你必须调用 run_parallel_subagents，tasks 至少含：',
      '1) kind=deep_research 的调研 task；',
      `2) kind=delegate_character_timeline 的时间线 task（${who}写清章节与事件）。`,
      '禁止拆成先后两步或只在对话里口头完成。',
    ].join('')
  }

  if (kind === 'delegate_character_timeline') {
    const who = options?.focusCharacterName
      ? `characterName="${options.focusCharacterName}"，`
      : ''
    return [
      '【子 Agent 委派 — 本回合必做】',
      `用户意图属于角色时间线 / 龙套 / character_event。你必须在本回合内调用 delegate_character_timeline（${who}task 写清章节与要写入的事件），`,
      '由子助手 create/update_character_event 落库；禁止只在对话里罗列名字却不调用工具。',
    ].join('')
  }

  return [
    '【子 Agent 委派 — 本回合必做】',
    '用户需跨章节或跨设定核实。你必须先调用 deep_research（task 写明范围与核对点），',
    '再根据返回摘要决定是否 append_chapter 或 propose_edit；禁止未调研就长篇臆测改稿。',
  ].join('')
}

/** 写入 @ 角色上下文块时的简短触发说明 */
export function buildCharacterSubagentLine(
  userText: string,
  characterName: string,
): string | null {
  const kind = detectSubagentTrigger(userText, {
    hasFocusCharacter: true,
    focusCharacterName: characterName,
  })
  if (kind !== 'delegate_character_timeline') return null
  return `若任务与 ${characterName} 的章节龙套/时间线相关，请调用 delegate_character_timeline，勿仅口头回复。`
}

/** 用户侧可复制示例（文档 / system 共用） */
export const SUBAGENT_USER_PROMPT_EXAMPLES = [
  '@林渊 帮我在第三章补充龙套名字（传话、撞见、挨打、问路各一个），写入角色时间线事件。',
  '@苏晚 梳理她登场以来的关系变化与关键里程碑，更新 character_event。',
  '核对第三卷至今的主角行动与「雾港」世界观是否矛盾，先 deep_research 再建议改稿。',
  '通读第二卷各章，整理与「学院」设定相关的矛盾点，返回摘要。',
  '核对第三卷设定是否矛盾，同时把 @林渊 第三章龙套写入时间线。',
] as const
