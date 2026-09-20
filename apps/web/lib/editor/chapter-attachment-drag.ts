export const CHAPTER_ATTACHMENT_DRAG_MIME = 'application/x-narraverse-chapter'

export type ComposerAttachmentDragPayload =
  | { kind: 'chapter', id: string, title: string }
  | { kind: 'volume', id: string, title: string }

/** @deprecated 使用 ComposerAttachmentDragPayload */
export interface ChapterAttachmentDragPayload {
  id: string
  title: string
}

export function setComposerAttachmentDragData(
  dataTransfer: DataTransfer,
  payload: ComposerAttachmentDragPayload,
) {
  dataTransfer.setData(CHAPTER_ATTACHMENT_DRAG_MIME, JSON.stringify(payload))
  dataTransfer.effectAllowed = 'copy'
}

export function setChapterAttachmentDragData(
  dataTransfer: DataTransfer,
  chapter: { id: string, title: string },
) {
  setComposerAttachmentDragData(dataTransfer, { kind: 'chapter', ...chapter })
}

export function setVolumeAttachmentDragData(
  dataTransfer: DataTransfer,
  volume: { id: string, title: string },
) {
  setComposerAttachmentDragData(dataTransfer, { kind: 'volume', ...volume })
}

export function parseComposerAttachmentDragPayload(
  dataTransfer: DataTransfer,
): ComposerAttachmentDragPayload | null {
  const raw = dataTransfer.getData(CHAPTER_ATTACHMENT_DRAG_MIME)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (typeof parsed.id !== 'string' || typeof parsed.title !== 'string') {
      return null
    }
    if (parsed.kind === 'volume') {
      return { kind: 'volume', id: parsed.id, title: parsed.title }
    }
    if (parsed.kind === 'chapter') {
      return { kind: 'chapter', id: parsed.id, title: parsed.title }
    }
    return { kind: 'chapter', id: parsed.id, title: parsed.title }
  } catch {
    return null
  }
}

/** @deprecated 使用 parseComposerAttachmentDragPayload */
export function parseChapterAttachmentDragPayload(
  dataTransfer: DataTransfer,
): ChapterAttachmentDragPayload | null {
  const payload = parseComposerAttachmentDragPayload(dataTransfer)
  if (!payload || payload.kind === 'volume') return null
  return { id: payload.id, title: payload.title }
}

export function hasChapterAttachmentDrag(dataTransfer: DataTransfer): boolean {
  return dataTransfer.types.includes(CHAPTER_ATTACHMENT_DRAG_MIME)
}
