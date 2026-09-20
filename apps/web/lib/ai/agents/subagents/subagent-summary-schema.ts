import { z } from 'zod'

const contradictionItemSchema = z.object({
  description: z.string(),
  sources: z.array(z.string()).optional(),
})

const citationItemSchema = z.object({
  location: z.string(),
  excerpt: z.string().optional(),
  note: z.string().optional(),
})

const suggestionItemSchema = z.object({
  action: z.string(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
})

const timelineUpdateItemSchema = z.object({
  description: z.string(),
  chapterRef: z.string().optional(),
  eventType: z.string().optional(),
})

/** 子 Agent 最终摘要 JSON schema（调研 / 时间线共用） */
export const subagentStructuredSummarySchema = z.object({
  overview: z.string(),
  contradictions: z.array(contradictionItemSchema).default([]),
  citations: z.array(citationItemSchema).default([]),
  suggestions: z.array(suggestionItemSchema).default([]),
  timelineUpdates: z.array(timelineUpdateItemSchema).optional(),
})

export type SubagentStructuredSummary = z.infer<typeof subagentStructuredSummarySchema>
export type SubagentContradiction = z.infer<typeof contradictionItemSchema>
export type SubagentCitation = z.infer<typeof citationItemSchema>
export type SubagentSuggestion = z.infer<typeof suggestionItemSchema>
export type SubagentTimelineUpdate = z.infer<typeof timelineUpdateItemSchema>

export const SUBAGENT_SUMMARY_JSON_EXAMPLE: SubagentStructuredSummary = {
  overview: '第三卷前两章与「雾港」设定在港口管制时间上存在一处矛盾。',
  contradictions: [
    {
      description: '第二章写雾港宵禁 22:00，世界观设定为 23:00',
      sources: ['第二章', 'worldbook:雾港'],
    },
  ],
  citations: [
    {
      location: '第二章（chapterId: …）',
      excerpt: '……宵禁的钟声在十点响起……',
      note: '与设定冲突的关键句',
    },
  ],
  suggestions: [
    { action: '将第二章宵禁改为 23:00，或更新世界观条目', priority: 'high' },
  ],
}

const PRIORITY_LABEL: Record<NonNullable<SubagentSuggestion['priority']>, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export function extractJsonFromModelText(text: string): unknown | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed)
  } catch {
    // fall through
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim())
    } catch {
      // fall through
    }
  }

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1))
    } catch {
      return null
    }
  }

  return null
}

export function parseSubagentStructuredSummary(text: string): SubagentStructuredSummary | null {
  const raw = extractJsonFromModelText(text)
  if (!raw) return null

  const parsed = subagentStructuredSummarySchema.safeParse(raw)
  if (!parsed.success) return null
  return parsed.data
}

/** 结构化摘要 → 给主 Agent 的稳定纯文本 */
export function formatStructuredSummaryForModel(summary: SubagentStructuredSummary): string {
  const lines: string[] = ['【子 Agent 结构化摘要】', `总览：${summary.overview.trim()}`]

  if (summary.contradictions.length > 0) {
    lines.push('', '【矛盾点】')
    summary.contradictions.forEach((item, i) => {
      const sources = item.sources?.length ? `（来源：${item.sources.join('、')}）` : ''
      lines.push(`${i + 1}. ${item.description.trim()}${sources}`)
    })
  }

  if (summary.citations.length > 0) {
    lines.push('', '【引用位置】')
    summary.citations.forEach((item) => {
      const parts = [`- ${item.location.trim()}`]
      if (item.excerpt?.trim()) parts.push(`  摘录：${item.excerpt.trim()}`)
      if (item.note?.trim()) parts.push(`  说明：${item.note.trim()}`)
      lines.push(parts.join('\n'))
    })
  }

  if (summary.suggestions.length > 0) {
    lines.push('', '【建议】')
    summary.suggestions.forEach((item) => {
      const pri = item.priority ? `[${PRIORITY_LABEL[item.priority]}] ` : ''
      lines.push(`- ${pri}${item.action.trim()}`)
    })
  }

  if (summary.timelineUpdates?.length) {
    lines.push('', '【时间线变更】')
    summary.timelineUpdates.forEach((item) => {
      const meta = [item.eventType, item.chapterRef].filter(Boolean).join(' · ')
      const prefix = meta ? `（${meta}）` : ''
      lines.push(`- ${prefix}${item.description.trim()}`)
    })
  }

  return lines.join('\n').trim()
}

export function finalizeSubagentSummary(rawText: string): {
  summaryRaw: string
  structuredSummary: SubagentStructuredSummary | null
  summary: string
} {
  const summaryRaw = rawText.trim()
  const structuredSummary = parseSubagentStructuredSummary(summaryRaw)
  const summary = structuredSummary
    ? formatStructuredSummaryForModel(structuredSummary)
    : summaryRaw

  return { summaryRaw, structuredSummary, summary }
}

export const SUBAGENT_RESEARCH_SUMMARY_PROMPT = `【最终摘要 — JSON Schema，必须遵守】
完成所有工具调用后，**最后一条回复**有且仅有一个 JSON 对象（不要 markdown 代码块、不要其它文字）。
字段说明：
- overview（string，必填）：一两句话总览
- contradictions（array）：矛盾点；每项含 description，可选 sources（章节名/设定名）
- citations（array）：引用位置；每项含 location，可选 excerpt、note
- suggestions（array）：给主 Agent 的改稿/续写建议；每项含 action，可选 priority（high/medium/low）

示例：
${JSON.stringify(SUBAGENT_SUMMARY_JSON_EXAMPLE, null, 2)}`

export const SUBAGENT_TIMELINE_SUMMARY_PROMPT = `【最终摘要 — JSON Schema，必须遵守】
完成工具调用与 character_event 落库后，**最后一条回复**有且仅有一个 JSON 对象（不要 markdown 代码块、不要其它文字）。
字段说明：
- overview（string，必填）：完成了哪些时间线维护
- contradictions（array，可空）：发现的设定/正文矛盾
- citations（array）：相关章节或设定引用位置；含 location，可选 excerpt、note
- suggestions（array，可空）：需主写作 Agent 用 append_chapter/propose_edit 落地的建议
- timelineUpdates（array，可选）：本次 create/update 的事件摘要；含 description，可选 chapterRef、eventType

contradictions / citations / suggestions 无内容时用 []。`
