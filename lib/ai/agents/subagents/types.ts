/** 单个子 Agent 工具名（writer 委派用的 subagent-as-tool）。 */
export const SUBAGENT_TOOL_NAMES = [
  'deep_research',
  'delegate_character_timeline',
] as const

export type SubagentToolName = typeof SUBAGENT_TOOL_NAMES[number]

/** 并行批量委派工具名 */
export const PARALLEL_SUBAGENT_TOOL_NAME = 'run_parallel_subagents' as const

/** 单次并行委派上限 */
export const MAX_PARALLEL_SUBAGENT_TASKS = 4

export type WriterSubagentToolName
  = | SubagentToolName
    | typeof PARALLEL_SUBAGENT_TOOL_NAME

export function isSubagentToolName(name: string): name is SubagentToolName {
  return (SUBAGENT_TOOL_NAMES as readonly string[]).includes(name)
}

export function isParallelSubagentToolName(name: string): boolean {
  return name === PARALLEL_SUBAGENT_TOOL_NAME
}

export function isWriterSubagentToolName(name: string): name is WriterSubagentToolName {
  return isSubagentToolName(name) || isParallelSubagentToolName(name)
}

/** UI 截断常量：步骤文本预览最大字符数 */
export const SUBAGENT_STEP_PREVIEW_MAX_CHARS = 120
/** UI 截断常量：实时预览面板最大高度（行数） */
export const SUBAGENT_LIVE_PREVIEW_MAX_LINES = 8

/** 子 Agent 工具返回给主模型与 UI 的结构化结果 */
export interface SubagentStepLog {
  stepNumber: number
  /** 本步新增的正文片段（若有） */
  textDelta?: string
  /** 本步调用的工具名 */
  toolNames?: string[]
}

export type SubagentRunStatus = 'running' | 'done' | 'error'

export interface SubagentToolOutput {
  status: SubagentRunStatus
  /** 流式预览（子 agent 正在生成的摘要草稿） */
  preview?: string
  /** 完成后返回给主 Agent 的摘要 */
  summary?: string
  steps?: SubagentStepLog[]
  error?: string
}

export function isSubagentToolOutput(value: unknown): value is SubagentToolOutput {
  if (!value || typeof value !== 'object') return false
  const o = value as SubagentToolOutput
  return o.status === 'running' || o.status === 'done' || o.status === 'error'
}

/** 并行委派中单个 slot 的状态 */
export interface ParallelSubagentTaskOutput {
  index: number
  kind: SubagentToolName
  input: Record<string, unknown>
  status: SubagentRunStatus
  preview?: string
  summary?: string
  steps?: SubagentStepLog[]
  error?: string
}

/** 并行委派工具的结构化输出 */
export interface ParallelSubagentToolOutput {
  status: SubagentRunStatus
  tasks: ParallelSubagentTaskOutput[]
}

export function isParallelSubagentToolOutput(value: unknown): value is ParallelSubagentToolOutput {
  if (!value || typeof value !== 'object') return false
  const o = value as ParallelSubagentToolOutput
  return (
    (o.status === 'running' || o.status === 'done' || o.status === 'error')
    && Array.isArray(o.tasks)
  )
}

const SUBAGENT_KIND_LABELS: Record<SubagentToolName, string> = {
  deep_research: '深度调研',
  delegate_character_timeline: '角色时间线',
}

/** 并行委派结果合并为给主模型的纯文本 */
export function parallelSubagentOutputToModelText(output: unknown): string {
  if (typeof output === 'string') return output.trim()
  if (!isParallelSubagentToolOutput(output)) {
    return subagentOutputToModelText(output)
  }

  if (output.status === 'error' && output.tasks.length === 0) {
    return '并行子 Agent 执行失败'
  }

  const sections = output.tasks.map((task) => {
    const label = SUBAGENT_KIND_LABELS[task.kind] ?? task.kind
    const header = `## 任务 ${task.index} · ${label}`
    if (task.status === 'error') {
      return `${header}\n${task.error || '执行失败'}`
    }
    const body = (task.summary || task.preview || '').trim()
    return `${header}\n${body || '（无摘要）'}`
  })

  return sections.join('\n\n').trim() || '并行子 Agent 已完成，但未返回摘要。'
}

/** 把 subagent 输出归一为「给主模型看的纯文本」。 */
export function subagentOutputToModelText(output: unknown): string {
  if (typeof output === 'string') return output.trim()
  if (isParallelSubagentToolOutput(output)) {
    return parallelSubagentOutputToModelText(output)
  }
  if (isSubagentToolOutput(output)) {
    if (output.status === 'error') {
      return output.error || '子 Agent 执行失败'
    }
    return (output.summary || output.preview || '').trim()
      || '子 Agent 已完成，但未返回摘要。'
  }
  return '子 Agent 已完成。'
}
