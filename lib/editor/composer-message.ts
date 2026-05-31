import {
  extractContextChapterRefs,
  parseComposerSegments,
  stripRefMarkers,
  type ComposerSegment,
  type SerializedChapterRef,
} from './inline-composer'

export const CHAPTER_REF_PART_TYPE = 'data-chapter-ref' as const
export const VOLUME_REF_PART_TYPE = 'data-volume-ref' as const

export interface ChapterRefPartData {
  id: string
  title: string
}

export interface VolumeRefPartData {
  id: string
  title: string
}

export type UserComposerPart =
  | { type: 'text', text: string, state?: 'done' }
  | { type: typeof CHAPTER_REF_PART_TYPE, data: ChapterRefPartData }
  | { type: typeof VOLUME_REF_PART_TYPE, data: VolumeRefPartData }

export interface UserComposerMessagePayload {
  parts: UserComposerPart[]
  plainText: string
  chapters: SerializedChapterRef[]
  /** 发给 API / 存入 content 字段的文本 */
  apiText: string
}

export function formatRefsFallback(
  segments: ComposerSegment[],
): string {
  const chunks: string[] = []
  for (const segment of segments) {
    if (segment.type === 'chapter' || segment.type === 'volume') {
      chunks.push(`@${segment.title}`)
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
  return [{
    type: CHAPTER_REF_PART_TYPE,
    data: { id: segment.id, title: segment.title },
  }]
}

export function buildUserComposerMessage(
  raw: string,
  allChapters: Array<{ id: string, title: string, volume_id?: string | null }> = [],
): UserComposerMessagePayload {
  const segments = parseComposerSegments(raw)
  const parts = segments.flatMap(segmentToParts)
  const chapters = extractContextChapterRefs(raw, allChapters)
  const plainText = stripRefMarkers(raw).trim()
  const apiText = plainText || formatRefsFallback(segments)

  if (parts.length === 0 && apiText) {
    parts.push({ type: 'text', text: apiText, state: 'done' })
  }

  return { parts, plainText, chapters, apiText }
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

export function isInlineRefPart(part: unknown): boolean {
  return isChapterRefPart(part) || isVolumeRefPart(part)
}

export function extractApiTextFromUserMessage(parts: unknown[]): string {
  const chunks: string[] = []
  for (const raw of parts) {
    if (isChapterRefPart(raw) || isVolumeRefPart(raw)) {
      chunks.push(`@${raw.data.title}`)
      continue
    }
    const part = raw as { type?: string, text?: string }
    if (part?.type === 'text' && part.text) {
      chunks.push(part.text)
    }
  }
  return chunks.join('').trim()
}

/** @deprecated 使用 formatRefsFallback */
export function formatChapterRefsFallback(chapters: SerializedChapterRef[]): string {
  return chapters.map(c => `@${c.title}`).join(' ')
}
