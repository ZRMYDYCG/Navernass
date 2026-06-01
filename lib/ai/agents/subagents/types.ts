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

export function subagentOutputToModelText(output: unknown): string {
  if (typeof output === 'string') return output.trim()
  if (isSubagentToolOutput(output)) {
    if (output.status === 'error') {
      return output.error || '子 Agent 执行失败'
    }
    return (output.summary || output.preview || '').trim()
      || '子 Agent 已完成，但未返回摘要。'
  }
  return '子 Agent 已完成。'
}
