/** 内联引用块在 input 字符串中的序列化格式 */
const REF_MARKER_RE = /\[\[(ch|vol|char):([^:\]]+):([^\]]+)\]\]/g
const CHAPTER_MARKER_RE = /\[\[ch:([^:\]]+):([^\]]+)\]\]/g
const VOLUME_MARKER_RE = /\[\[vol:([^:\]]+):([^\]]+)\]\]/g
const CHARACTER_MARKER_RE = /\[\[char:([^:\]]+):([^\]]+)\]\]/g

export interface SerializedChapterRef {
  id: string
  title: string
}

export interface SerializedVolumeRef {
  id: string
  title: string
}

export interface SerializedCharacterRef {
  id: string
  name: string
}

export function encodeChapterMarker(chapter: SerializedChapterRef): string {
  return `[[ch:${chapter.id}:${encodeURIComponent(chapter.title)}]]`
}

export function encodeVolumeMarker(volume: SerializedVolumeRef): string {
  return `[[vol:${volume.id}:${encodeURIComponent(volume.title)}]]`
}

export function encodeCharacterMarker(character: SerializedCharacterRef): string {
  return `[[char:${character.id}:${encodeURIComponent(character.name)}]]`
}

/** 从序列化文本提取显式 @ 的章节（按出现顺序，允许同一章多次出现在正文） */
export function extractChapterMarkersFromSerialized(value: string): SerializedChapterRef[] {
  const chapters: SerializedChapterRef[] = []
  for (const match of value.matchAll(CHAPTER_MARKER_RE)) {
    chapters.push({
      id: match[1],
      title: decodeURIComponent(match[2]),
    })
  }
  return chapters
}

/** 从序列化文本提取显式 @ 的卷（按出现顺序，允许同一卷多次） */
export function extractCharacterMarkersFromSerialized(value: string): SerializedCharacterRef[] {
  const characters: SerializedCharacterRef[] = []
  for (const match of value.matchAll(CHARACTER_MARKER_RE)) {
    characters.push({
      id: match[1],
      name: decodeURIComponent(match[2]),
    })
  }
  return characters
}

export function extractVolumeMarkersFromSerialized(value: string): SerializedVolumeRef[] {
  const volumes: SerializedVolumeRef[] = []
  for (const match of value.matchAll(VOLUME_MARKER_RE)) {
    volumes.push({
      id: match[1],
      title: decodeURIComponent(match[2]),
    })
  }
  return volumes
}

/**
 * 发给 API 的章节上下文：显式章节 + 卷内章节，按正文出现顺序去重 id。
 */
export function extractContextChapterRefs(
  value: string,
  allChapters: Array<{ id: string, title: string, volume_id?: string | null }>,
): SerializedChapterRef[] {
  const result: SerializedChapterRef[] = []
  const seen = new Set<string>()

  const addChapter = (ch: { id: string, title: string }) => {
    if (seen.has(ch.id)) return
    seen.add(ch.id)
    result.push({ id: ch.id, title: ch.title })
  }

  for (const segment of parseComposerSegments(value)) {
    if (segment.type === 'chapter') {
      const full = allChapters.find(c => c.id === segment.id)
      addChapter(full ?? { id: segment.id, title: segment.title })
    } else if (segment.type === 'volume') {
      for (const ch of allChapters) {
        if (ch.volume_id === segment.id) {
          addChapter(ch)
        }
      }
    }
  }

  return result
}

/** 从正文 @ 角色标记提取角色（按出现顺序去重 id） */
export function extractContextCharacterRefs(value: string): SerializedCharacterRef[] {
  const result: SerializedCharacterRef[] = []
  const seen = new Set<string>()
  for (const segment of parseComposerSegments(value)) {
    if (segment.type !== 'character') continue
    if (seen.has(segment.id)) continue
    seen.add(segment.id)
    result.push({ id: segment.id, name: segment.name })
  }
  return result
}

/** @deprecated 使用 extractContextChapterRefs；保留兼容旧调用 */
export function extractChaptersFromSerialized(value: string): SerializedChapterRef[] {
  const seen = new Set<string>()
  const chapters: SerializedChapterRef[] = []
  for (const ch of extractChapterMarkersFromSerialized(value)) {
    if (seen.has(ch.id)) continue
    seen.add(ch.id)
    chapters.push(ch)
  }
  return chapters
}

export function stripRefMarkers(value: string): string {
  return value.replace(REF_MARKER_RE, '')
}

/** @deprecated 使用 stripRefMarkers */
export function stripChapterMarkers(value: string): string {
  return stripRefMarkers(value)
}

export function hasComposerContent(value: string): boolean {
  return stripRefMarkers(value).trim().length > 0
    || /\[\[ch:[^:\]]+:[^\]]+\]\]/.test(value)
    || /\[\[vol:[^:\]]+:[^\]]+\]\]/.test(value)
    || /\[\[char:[^:\]]+:[^\]]+\]\]/.test(value)
}

export function chapterRefsEqual(
  a: SerializedChapterRef[],
  b: SerializedChapterRef[],
): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].title !== b[i].title) return false
  }
  return true
}

export function characterRefsEqual(
  a: SerializedCharacterRef[],
  b: SerializedCharacterRef[],
): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].name !== b[i].name) return false
  }
  return true
}

export type ComposerSegment =
  | { type: 'text', value: string }
  | { type: 'chapter', id: string, title: string }
  | { type: 'volume', id: string, title: string }
  | { type: 'character', id: string, name: string }

export function parseComposerSegments(value: string): ComposerSegment[] {
  if (!value) return [{ type: 'text', value: '' }]

  const segments: ComposerSegment[] = []
  let lastIndex = 0

  for (const match of value.matchAll(REF_MARKER_RE)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      segments.push({ type: 'text', value: value.slice(lastIndex, index) })
    }
    const kind = match[1]
    const id = match[2]
    const title = decodeURIComponent(match[3])
    if (kind === 'ch') {
      segments.push({ type: 'chapter', id, title })
    } else if (kind === 'vol') {
      segments.push({ type: 'volume', id, title })
    } else {
      segments.push({ type: 'character', id, name: title })
    }
    lastIndex = index + match[0].length
  }

  if (lastIndex < value.length) {
    segments.push({ type: 'text', value: value.slice(lastIndex) })
  }

  if (segments.length === 0) {
    return [{ type: 'text', value: '' }]
  }

  return segments
}

export function serializeComposerSegments(segments: ComposerSegment[]): string {
  return segments
    .map((segment) => {
      if (segment.type === 'text') return segment.value
      if (segment.type === 'chapter') {
        return encodeChapterMarker({ id: segment.id, title: segment.title })
      }
      if (segment.type === 'volume') {
        return encodeVolumeMarker({ id: segment.id, title: segment.title })
      }
      return encodeCharacterMarker({ id: segment.id, name: segment.name })
    })
    .join('')
}

export interface MentionQueryMatch {
  query: string
  startOffset: number
}

/** 从光标前的纯文本中解析 @ 提及查询（@ 后至光标） */
export function getMentionQueryFromTextBefore(textBefore: string): MentionQueryMatch | null {
  const match = textBefore.match(/@([^\s@\[\]]*)$/)
  if (!match) return null
  return {
    query: match[1],
    startOffset: textBefore.length - match[0].length,
  }
}

export type MentionListItem =
  | { type: 'volume', id: string, title: string }
  | { type: 'chapter', id: string, title: string }
  | { type: 'character', id: string, name: string }

export function filterMentionListItems(
  volumes: Array<{ id: string, title: string }>,
  chapters: Array<{ id: string, title: string }>,
  query: string,
  characters: Array<{ id: string, name: string }> = [],
): MentionListItem[] {
  const q = query.trim().toLowerCase()
  const matchTitle = (title: string) => !q || title.toLowerCase().includes(q)
  const matchName = (name: string) => !q || name.toLowerCase().includes(q)

  const volumeItems: MentionListItem[] = volumes
    .filter(v => matchTitle(v.title))
    .map(v => ({ type: 'volume' as const, id: v.id, title: v.title }))

  const chapterItems: MentionListItem[] = chapters
    .filter(c => matchTitle(c.title))
    .map(c => ({ type: 'chapter' as const, id: c.id, title: c.title }))

  const characterItems: MentionListItem[] = characters
    .filter(c => matchName(c.name))
    .map(c => ({ type: 'character' as const, id: c.id, name: c.name }))

  return [...volumeItems, ...chapterItems, ...characterItems]
}
