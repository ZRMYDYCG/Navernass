import type { Editor } from '@tiptap/react'
import { TextSelection } from '@tiptap/pm/state'

interface PlainTextIndex {
  plain: string
  /** plain[i] 对应的 ProseMirror doc 位置 */
  docPositions: number[]
}

/** 与 read_chapter / propose_edit 服务端 strip HTML 后的 plain 对齐：仅拼接文本节点，不加块级换行 */
export function buildPlainTextIndex(editor: Editor): PlainTextIndex {
  const docPositions: number[] = []
  const chars: string[] = []

  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    const text = node.text || ''
    for (let i = 0; i < text.length; i += 1) {
      chars.push(text[i]!)
      docPositions.push(pos + i)
    }
    return true
  })

  return { plain: chars.join(''), docPositions }
}

/** @deprecated 使用 buildPlainTextIndex；保留供调试 */
export function getEditorPlainText(editor: Editor): string {
  return buildPlainTextIndex(editor).plain
}

/** 与 read_chapter / propose_edit 服务端校验一致的 HTML 剥离 */
export function stripHtmlToPlain(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/** 忽略空白差异 */
export function normalizePlainText(text: string): string {
  return text.replace(/\s+/g, '')
}

function rangeFromPlainIndex(
  index: PlainTextIndex,
  start: number,
  len: number,
): { from: number, to: number } | null {
  if (len <= 0 || start < 0 || start >= index.plain.length) return null
  const end = Math.min(start + len, index.plain.length)
  const from = index.docPositions[start]
  const lastPos = index.docPositions[end - 1]
  if (from === undefined || lastPos === undefined) return null
  return { from, to: lastPos + 1 }
}

function findNormalizedMatch(
  plain: string,
  needle: string,
  searchFrom = 0,
): { start: number, length: number } | null {
  const normalizedNeedle = normalizePlainText(needle)
  if (!normalizedNeedle) return null

  for (let start = searchFrom; start < plain.length; start += 1) {
    const maxLen = Math.min(plain.length - start, needle.length + 32)
    for (let len = 1; len <= maxLen; len += 1) {
      const slice = plain.slice(start, start + len)
      if (normalizePlainText(slice) === normalizedNeedle) {
        return { start, length: len }
      }
      if (normalizePlainText(slice).length > normalizedNeedle.length) break
    }
  }

  return null
}

/** 用 needle 首尾锚点做容错定位（AI 摘抄可能有轻微偏差） */
function findAnchorMatch(plain: string, needle: string, hintOffset?: number): number | null {
  const trimmed = needle.trim()
  if (trimmed.length < 8) return null

  const anchorLen = Math.min(24, Math.max(8, Math.floor(trimmed.length * 0.35)))
  const head = trimmed.slice(0, anchorLen)
  const tail = trimmed.slice(-anchorLen)

  const searchStart = hintOffset != null && hintOffset >= 0
    ? Math.max(0, hintOffset - 40)
    : 0

  let idx = plain.indexOf(head, searchStart)
  while (idx >= 0) {
    const expectedEnd = idx + trimmed.length
    const tailAt = idx + trimmed.length - tail.length
    if (plain.slice(tailAt, tailAt + tail.length) === tail) {
      return idx
    }
    if (Math.abs(expectedEnd - plain.length) < 4 && plain.endsWith(tail)) {
      const start = plain.length - trimmed.length
      return start >= 0 ? start : null
    }
    idx = plain.indexOf(head, idx + 1)
  }

  const normalized = findNormalizedMatch(plain, head, searchStart)
  if (!normalized) return null

  const candidateStart = normalized.start
  const candidate = plain.slice(candidateStart, candidateStart + trimmed.length + 8)
  if (normalizePlainText(candidate).includes(normalizePlainText(head))
    && normalizePlainText(candidate).includes(normalizePlainText(tail))) {
    return candidateStart
  }

  return null
}

/**
 * 在 Tiptap 编辑器中定位 needle。
 * 优先与服务端 stripHtml plain 对齐，并支持 offset / 锚点容错。
 */
export function locateTextInEditor(
  editor: Editor,
  needle: string,
  hintOffset?: number,
  chapterHtml?: string,
): { from: number, to: number } | null {
  if (!needle.trim()) return null

  const index = buildPlainTextIndex(editor)
  const { plain } = index

  // 1. 精确匹配
  const exactIdx = plain.indexOf(needle)
  if (exactIdx >= 0) {
    return rangeFromPlainIndex(index, exactIdx, needle.length)
  }

  // 2. 服务端 offset（与 DB plain 对齐）
  if (hintOffset != null && hintOffset >= 0 && hintOffset < plain.length) {
    const atOffset = plain.slice(hintOffset, hintOffset + needle.length)
    if (atOffset === needle || normalizePlainText(atOffset) === normalizePlainText(needle)) {
      return rangeFromPlainIndex(index, hintOffset, needle.length)
    }
  }

  // 3. 忽略空白
  const normalized = findNormalizedMatch(
    plain,
    needle,
    hintOffset != null && hintOffset >= 0 ? hintOffset : 0,
  )
  if (normalized) {
    return rangeFromPlainIndex(index, normalized.start, normalized.length)
  }

  // 4. 锚点容错
  const anchorIdx = findAnchorMatch(plain, needle, hintOffset)
  if (anchorIdx != null) {
    const actualLen = Math.min(needle.length, plain.length - anchorIdx)
    return rangeFromPlainIndex(index, anchorIdx, actualLen)
  }

  // 5. 用章节 HTML 源再验一遍 offset，回到 editor plain 定位
  if (chapterHtml && hintOffset != null && hintOffset >= 0) {
    const sourcePlain = stripHtmlToPlain(chapterHtml)
    const sourceSlice = sourcePlain.slice(hintOffset, hintOffset + needle.length)
    if (sourceSlice && normalizePlainText(sourceSlice) === normalizePlainText(needle)) {
      const mapped = findNormalizedMatch(plain, sourceSlice, 0)
      if (mapped) {
        return rangeFromPlainIndex(index, mapped.start, mapped.length)
      }
    }
  }

  return null
}

export function scrollEditorToRange(editor: Editor, range: { from: number, to: number }): void {
  const { state, view } = editor
  const from = Math.max(0, Math.min(range.from, state.doc.content.size))
  const to = Math.max(from, Math.min(range.to, state.doc.content.size))
  const tr = state.tr.setSelection(TextSelection.create(state.doc, from, to))
  tr.scrollIntoView()
  view.dispatch(tr)
  editor.commands.focus()
}
