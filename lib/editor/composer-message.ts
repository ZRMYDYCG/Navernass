import {
  extractContextChapterRefs,
  extractContextCharacterRefs,
  parseComposerSegments,
  stripRefMarkers,
  type ComposerSegment,
  extractContextOutlineRefs,
  extractContextWorldbookRefs,
  type SerializedChapterRef,
  type SerializedCharacterRef,
  type SerializedOutlineRef,
  type SerializedWorldbookRef,
} from './inline-composer'

export const CHAPTER_REF_PART_TYPE = 'data-chapter-ref' as const
export const VOLUME_REF_PART_TYPE = 'data-volume-ref' as const
export const CHARACTER_REF_PART_TYPE = 'data-character-ref' as const
export const WORLDBOOK_REF_PART_TYPE = 'data-worldbook-ref' as const
export const OUTLINE_REF_PART_TYPE = 'data-outline-ref' as const

export interface ChapterRefPartData {
  id: string
  title: string
}

export interface VolumeRefPartData {
  id: string
  title: string
}

export interface CharacterRefPartData {
  id: string
  name: string
}

export interface WorldbookRefPartData {
  id: string
  title: string
}

export interface OutlineRefPartData {
  id: string
  title: string
}

export type UserComposerPart =
  | { type: 'text', text: string, state?: 'done' }
  | { type: typeof CHAPTER_REF_PART_TYPE, data: ChapterRefPartData }
  | { type: typeof VOLUME_REF_PART_TYPE, data: VolumeRefPartData }
  | { type: typeof CHARACTER_REF_PART_TYPE, data: CharacterRefPartData }
  | { type: typeof WORLDBOOK_REF_PART_TYPE, data: WorldbookRefPartData }
  | { type: typeof OUTLINE_REF_PART_TYPE, data: OutlineRefPartData }

export interface UserComposerMessagePayload {
  parts: UserComposerPart[]
  plainText: string
  chapters: SerializedChapterRef[]
  characters: SerializedCharacterRef[]
  worldbookEntries: SerializedWorldbookRef[]
  outlines: SerializedOutlineRef[]
  /** 发给 API / 存入 content 字段的文本 */
  apiText: string
}

export function formatRefsFallback(
  segments: ComposerSegment[],
): string {
  const chunks: string[] = []
  for (const segment of segments) {
    if (
      segment.type === 'chapter'
      || segment.type === 'volume'
      || segment.type === 'worldbook'
      || segment.type === 'outline'
    ) {
      chunks.push(`@${segment.title}`)
    } else if (segment.type === 'character') {
      chunks.push(`@${segment.name}`)
    }
  }
  return chunks.join(' ')
}

function segmentToParts(segment: ComposerSegment): UserComposerPart[] {
  if (segment.type === 'text') {
    return segment.value ? [{ type: 'text', text: segment.value, state: 'done' }] : []
  }
  if (segment.type === 'volume') {
    return [{
      type: VOLUME_REF_PART_TYPE,
      data: { id: segment.id, title: segment.title },
    }]
  }
  if (segment.type === 'character') {
    return [{
      type: CHARACTER_REF_PART_TYPE,
      data: { id: segment.id, name: segment.name },
    }]
  }
  if (segment.type === 'worldbook') {
    return [{
      type: WORLDBOOK_REF_PART_TYPE,
      data: { id: segment.id, title: segment.title },
    }]
  }
  if (segment.type === 'outline') {
    return [{
      type: OUTLINE_REF_PART_TYPE,
      data: { id: segment.id, title: segment.title },
    }]
  }
  if (segment.type === 'chapter') {
    return [{
      type: CHAPTER_REF_PART_TYPE,
      data: { id: segment.id, title: segment.title },
    }]
  }
  return []
}

export function buildUserComposerMessage(
  raw: string,
  allChapters: Array<{ id: string, title: string, volume_id?: string | null }> = [],
  allCharacters: Array<{ id: string, name: string }> = [],
  allWorldbookEntries: Array<{ id: string, title: string }> = [],
  allOutlines: Array<{ id: string, title: string }> = [],
): UserComposerMessagePayload {
  const segments = parseComposerSegments(raw)
  const parts = segments.flatMap(segmentToParts)
  const chapters = extractContextChapterRefs(raw, allChapters)
  const characters = extractContextCharacterRefs(raw).map((ref) => {
    const full = allCharacters.find(c => c.id === ref.id)
    return full ? { id: full.id, name: full.name } : ref
  })
  const worldbookEntries = extractContextWorldbookRefs(raw).map((ref) => {
    const full = allWorldbookEntries.find(e => e.id === ref.id)
    return full ? { id: full.id, title: full.title } : ref
  })
  const outlines = extractContextOutlineRefs(raw).map((ref) => {
    const full = allOutlines.find(o => o.id === ref.id)
    return full ? { id: full.id, title: full.title } : ref
  })
  const plainText = stripRefMarkers(raw).trim()
  const apiText = buildComposerApiText(segments, plainText)

  // UI：chip 即 @，text part 仅保留纯正文；勿把 @名字 再写入 text（会重复显示）
  syncDisplayTextParts(parts, plainText)

  return { parts, plainText, chapters, characters, worldbookEntries, outlines, apiText }
}

/** @ 引用 + 正文合并为模型可见的一行（避免 sanitize 去掉 chip 后丢失 @） */
export function buildComposerApiText(
  segments: ComposerSegment[],
  plainText: string,
): string {
  const refs = formatRefsFallback(segments).trim()
  const body = plainText.trim()
  if (refs && body) return `${refs} ${body}`
  return refs || body
}

/** 用户消息 parts 折叠为单条 text（发给 LLM 前） */
export function collapseUserPartsForModel(parts: unknown[]): unknown[] {
  const apiText = extractApiTextFromUserMessage(parts).trim()
  if (!apiText) return parts

  const extras = parts.filter((raw) => {
    const part = raw as { type?: string }
    return part?.type !== 'text' && !isInlineRefPart(raw)
  })

  return [{ type: 'text', text: apiText, state: 'done' }, ...extras]
}

/** 仅同步纯正文到 text part；有 @ chip 时不注入 "@名字" 文本 */
function syncDisplayTextParts(parts: UserComposerPart[], plainText: string) {
  const body = plainText.trim()
  const textIndices = parts
    .map((p, i) => (p.type === 'text' ? i : -1))
    .filter(i => i >= 0)

  if (body) {
    if (textIndices.length === 0) {
      parts.push({ type: 'text', text: body, state: 'done' })
      return
    }
    parts[textIndices[0]] = { type: 'text', text: body, state: 'done' }
    for (let i = textIndices.length - 1; i >= 1; i--) {
      parts.splice(textIndices[i], 1)
    }
    return
  }

  // 仅 @ chip、无正文：去掉多余的 "@名字" 纯文本 part
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]
    if (p.type !== 'text' || typeof p.text !== 'string') continue
    const t = p.text.trim()
    if (!t || /^@[^\s@]+(\s+@[^\s@]+)*$/.test(t)) {
      parts.splice(i, 1)
    }
  }
}

/** 用户是否只发了 @ 引用（无额外说明文字） */
export function isRefsOnlyUserMessage(parts: unknown[]): boolean {
  if (!parts.some(p => isInlineRefPart(p))) return false
  const apiText = extractApiTextFromUserMessage(parts).trim()
  if (!apiText) return false
  return /^@[^\s@]+(\s+@[^\s@]+)*$/.test(apiText)
}

export function isChapterRefPart(part: unknown): part is { type: typeof CHAPTER_REF_PART_TYPE, data: ChapterRefPartData } {
  return typeof part === 'object'
    && part !== null
    && (part as { type?: string }).type === CHAPTER_REF_PART_TYPE
    && typeof (part as { data?: { id?: string } }).data?.id === 'string'
}

export function isVolumeRefPart(part: unknown): part is { type: typeof VOLUME_REF_PART_TYPE, data: VolumeRefPartData } {
  return typeof part === 'object'
    && part !== null
    && (part as { type?: string }).type === VOLUME_REF_PART_TYPE
    && typeof (part as { data?: { id?: string } }).data?.id === 'string'
}

export function isCharacterRefPart(part: unknown): part is { type: typeof CHARACTER_REF_PART_TYPE, data: CharacterRefPartData } {
  return typeof part === 'object'
    && part !== null
    && (part as { type?: string }).type === CHARACTER_REF_PART_TYPE
    && typeof (part as { data?: { id?: string } }).data?.id === 'string'
}

export function isWorldbookRefPart(part: unknown): part is { type: typeof WORLDBOOK_REF_PART_TYPE, data: WorldbookRefPartData } {
  return typeof part === 'object'
    && part !== null
    && (part as { type?: string }).type === WORLDBOOK_REF_PART_TYPE
    && typeof (part as { data?: { id?: string } }).data?.id === 'string'
}

export function isOutlineRefPart(part: unknown): part is { type: typeof OUTLINE_REF_PART_TYPE, data: OutlineRefPartData } {
  return typeof part === 'object'
    && part !== null
    && (part as { type?: string }).type === OUTLINE_REF_PART_TYPE
    && typeof (part as { data?: { id?: string } }).data?.id === 'string'
}

export function isInlineRefPart(part: unknown): boolean {
  return isChapterRefPart(part)
    || isVolumeRefPart(part)
    || isCharacterRefPart(part)
    || isWorldbookRefPart(part)
    || isOutlineRefPart(part)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 从 text 中去掉与 chip 重复的 @提及（兼容旧消息） */
function stripRedundantAtMentions(text: string, names: string[]): string {
  let body = text.trim()
  for (const name of names) {
    if (!name) continue
    const re = new RegExp(`@${escapeRegExp(name)}(?=\\s|$)`, 'g')
    body = body.replace(re, '').replace(/\s+/g, ' ').trim()
  }
  return body
}

/** 合并 chip + 正文，供 API / 模型使用（不在 UI parts 里写 @ 文本） */
export function extractApiTextFromUserMessage(parts: unknown[]): string {
  const refChunks: string[] = []
  const mentionNames: string[] = []
  const textChunks: string[] = []

  for (const raw of parts) {
    if (isChapterRefPart(raw) || isVolumeRefPart(raw)) {
      refChunks.push(`@${raw.data.title}`)
      mentionNames.push(raw.data.title)
      continue
    }
    if (isCharacterRefPart(raw)) {
      refChunks.push(`@${raw.data.name}`)
      mentionNames.push(raw.data.name)
      continue
    }
    if (isWorldbookRefPart(raw) || isOutlineRefPart(raw)) {
      refChunks.push(`@${raw.data.title}`)
      mentionNames.push(raw.data.title)
      continue
    }
    const part = raw as { type?: string, text?: string }
    if (part?.type === 'text' && part.text) {
      textChunks.push(part.text)
    }
  }

  const body = stripRedundantAtMentions(
    textChunks.join(' ').replace(/\s+/g, ' ').trim(),
    mentionNames,
  )
  const refs = refChunks.join(' ')
  if (refs && body) return `${refs} ${body}`
  return refs || body
}

/** @deprecated 使用 formatRefsFallback */
export function formatChapterRefsFallback(chapters: SerializedChapterRef[]): string {
  return chapters.map(c => `@${c.title}`).join(' ')
}

export { extractCharacterRefsFromMessageParts } from './character-composer'
export { extractWorldbookRefsFromMessageParts } from './worldbook-composer'
export { extractOutlineRefsFromMessageParts } from './outline-composer'
