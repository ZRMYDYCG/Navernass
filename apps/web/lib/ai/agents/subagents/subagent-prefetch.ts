import type { ToolContext } from '../types'
import type { SubagentPrefetchContext, SubagentPrefetchInput } from './types'

export type { SubagentPrefetchContext, SubagentPrefetchInput } from './types'

/** 单章预加载正文上限（字符） */
export const SUBAGENT_PREFETCH_CHAPTER_MAX_CHARS = 12_000
/** 单条世界观/大纲预加载正文上限 */
export const SUBAGENT_PREFETCH_ENTRY_MAX_CHARS = 6_000
/** 预加载块总上限（字符） */
export const SUBAGENT_PREFETCH_TOTAL_MAX_CHARS = 32_000

function truncateText(text: string, maxChars: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxChars) return trimmed
  return `${trimmed.slice(0, maxChars)}…（已截断，剩余内容请用 read 工具按需读取）`
}

function buildChapterPrefetchSection(
  chapters: Array<{ id: string, title: string, content: string }>,
): { section: string, ids: string[] } {
  if (chapters.length === 0) return { section: '', ids: [] }
  const ids = chapters.map(ch => ch.id)
  const body = chapters
    .map(ch => `## ${ch.title}（chapterId: ${ch.id}）\n\n${truncateText(ch.content, SUBAGENT_PREFETCH_CHAPTER_MAX_CHARS)}`)
    .join('\n\n---\n\n')
  return {
    section: `【预加载 · @ 章节】\n${body}`,
    ids,
  }
}

function buildWorldbookPrefetchSection(
  entries: Array<{ id: string, title: string, content: string }>,
): { section: string, ids: string[] } {
  if (entries.length === 0) return { section: '', ids: [] }
  const ids = entries.map(e => e.id)
  const body = entries
    .map(entry => `## ${entry.title}（worldbookId: ${entry.id}）\n\n${truncateText(entry.content, SUBAGENT_PREFETCH_ENTRY_MAX_CHARS)}`)
    .join('\n\n---\n\n')
  return {
    section: `【预加载 · @ 世界观】\n${body}`,
    ids,
  }
}

function buildOutlinePrefetchSection(
  outlines: Array<{ id: string, title: string, content: string }>,
): { section: string, ids: string[] } {
  if (outlines.length === 0) return { section: '', ids: [] }
  const ids = outlines.map(o => o.id)
  const body = outlines
    .map(outline => `## ${outline.title}（outlineId: ${outline.id}）\n\n${truncateText(outline.content, SUBAGENT_PREFETCH_ENTRY_MAX_CHARS)}`)
    .join('\n\n---\n\n')
  return {
    section: `【预加载 · @ 大纲】\n${body}`,
    ids,
  }
}

/**
 * 从 stream route 已加载的 @ 引用数据组装 subagent 预加载块。
 */
export function assembleSubagentPrefetch(input: SubagentPrefetchInput): SubagentPrefetchContext | undefined {
  const sections: string[] = []
  const chapterIds: string[] = []
  const worldbookEntryIds: string[] = []
  const outlineIds: string[] = []

  if (input.chapters?.length) {
    const { section, ids } = buildChapterPrefetchSection(input.chapters)
    if (section) {
      sections.push(section)
      chapterIds.push(...ids)
    }
  }

  const characterBlock = input.characterBlock?.trim()
  if (characterBlock) {
    sections.push(characterBlock.replace(/^【@ 角色上下文】/, '【预加载 · @ 角色】'))
  }

  if (input.worldbookEntries?.length) {
    const { section, ids } = buildWorldbookPrefetchSection(input.worldbookEntries)
    if (section) {
      sections.push(section)
      worldbookEntryIds.push(...ids)
    }
  }

  if (input.outlines?.length) {
    const { section, ids } = buildOutlinePrefetchSection(input.outlines)
    if (section) {
      sections.push(section)
      outlineIds.push(...ids)
    }
  }

  if (sections.length === 0) return undefined

  const block = truncateText(sections.join('\n\n'), SUBAGENT_PREFETCH_TOTAL_MAX_CHARS)

  return {
    chapterIds,
    worldbookEntryIds,
    outlineIds,
    block,
  }
}

function buildSkipReadHint(prefetch: SubagentPrefetchContext): string {
  const hints: string[] = []

  if (prefetch.chapterIds.length > 0) {
    hints.push(
      `以下 chapterId 正文已在下方预加载，优先直接引用，勿再 read_chapter：${prefetch.chapterIds.join('、')}`,
    )
  }
  if (prefetch.worldbookEntryIds.length > 0) {
    hints.push(
      `以下 worldbookId 已在下方预加载，勿再 read_worldbook_entry：${prefetch.worldbookEntryIds.join('、')}`,
    )
  }
  if (prefetch.outlineIds.length > 0) {
    hints.push(
      `以下 outlineId 大纲已在下方预加载，勿重复 list/read：${prefetch.outlineIds.join('、')}`,
    )
  }

  if (hints.length === 0) return ''
  return `【IO 提示】${hints.join('；')}。仅当任务涉及未预加载的其他章节/设定时再调用 read/list 工具。`
}

/** 将主对话已加载的 @ 上下文拼入 subagent 的 user message */
export function enrichSubagentUserMessage(task: string, ctx: ToolContext): string {
  const trimmedTask = task.trim()
  const prefetch = ctx.subagentPrefetch
  if (!prefetch?.block?.trim()) return trimmedTask

  const skipHint = buildSkipReadHint(prefetch)

  return [
    '【委派任务】',
    trimmedTask,
    skipHint,
    '【主对话已预加载的 @ 引用（优先使用）】',
    prefetch.block.trim(),
  ].filter(Boolean).join('\n\n')
}

export const SUBAGENT_PREFETCH_SYSTEM_HINT = `【预加载上下文】
若 user 消息中含「预加载 · @ 章节/世界观/大纲/角色」块，表示主 Agent 已从用户 @ 引用加载过正文。
- 优先基于预加载内容完成任务，减少 read_chapter / read_worldbook_entry 等重复 IO
- 仅当任务明确涉及未出现在预加载块中的章节或设定时，再调用 read/list 工具
- 预加载块若标注「已截断」，可针对该 chapterId 再 read_chapter 读取剩余部分`
