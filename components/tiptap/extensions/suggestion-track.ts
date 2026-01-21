import type { MarkType, Node as ProseMirrorNode, Schema } from '@tiptap/pm/model'
import type { EditorState } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/react'
import { Mark, mergeAttributes } from '@tiptap/core'
import { Fragment, Slice } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'

interface SuggestionSegment {
  type: 'equal' | 'add' | 'del'
  text: string
}

interface Range { from: number, to: number }

const MAX_DIFF_CELLS = 4_000_000

export const SuggestionAdd = Mark.create({
  name: 'suggestion_add',
  excludes: 'suggestion_add suggestion_del',
  parseHTML() {
    return [
      { tag: 'span[data-suggestion="add"]' },
      { tag: 'span.suggestion-add' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-suggestion': 'add',
        'class': 'suggestion-add',
      }),
      0,
    ]
  },
})

export const SuggestionDel = Mark.create({
  name: 'suggestion_del',
  excludes: 'suggestion_add suggestion_del',
  parseHTML() {
    return [
      { tag: 'span[data-suggestion="del"]' },
      { tag: 'span.suggestion-del' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-suggestion': 'del',
        'class': 'suggestion-del',
      }),
      0,
    ]
  },
})

export function applySuggestionDiff(
  editor: Editor,
  range: Range,
  originalText: string,
  suggestedText: string,
): Range | null {
  const { state, view } = editor
  const { schema } = state
  const addMark = schema.marks.suggestion_add
  const delMark = schema.marks.suggestion_del

  if (!addMark || !delMark) {
    editor.chain().focus().deleteRange(range).insertContent(suggestedText).run()
    const fallbackTo = range.from + suggestedText.length
    return { from: range.from, to: fallbackTo }
  }

  if (!originalText && !suggestedText) return null
  if (originalText === suggestedText) return null

  const segments = buildSegments(originalText, suggestedText)
  const hasChanges = segments.some(segment => segment.type !== 'equal')
  if (!hasChanges) return null

  const fragment = buildInlineFragment(schema, segments, addMark, delMark)
  const slice = Slice.maxOpen(fragment)
  const mappedFrom = clampPosition(range.from, state.doc.content.size)
  const mappedTo = clampPosition(range.to, state.doc.content.size)
  const normalized = mappedFrom <= mappedTo ? { from: mappedFrom, to: mappedTo } : { from: mappedTo, to: mappedFrom }
  const tr = state.tr.replaceRange(normalized.from, normalized.to, slice)

  const selectionTo = clampPosition(normalized.from + fragment.size, tr.doc.content.size)
  tr.setSelection(TextSelection.create(tr.doc, normalized.from, selectionTo))
  tr.scrollIntoView()
  view.dispatch(tr)

  return { from: normalized.from, to: selectionTo }
}

export function insertSuggestionText(editor: Editor, pos: number, text: string): Range | null {
  const { state, view } = editor
  const addMark = state.schema.marks.suggestion_add
  if (!addMark) {
    editor.chain().focus().insertContentAt(pos, text).run()
    return { from: pos, to: pos + text.length }
  }

  if (!text) return null
  const fragment = buildInlineFragment(state.schema, [{ type: 'add', text }], addMark, null)
  const slice = Slice.maxOpen(fragment)
  const mappedPos = clampPosition(pos, state.doc.content.size)
  const tr = state.tr.replaceRange(mappedPos, mappedPos, slice)
  const selectionTo = clampPosition(mappedPos + fragment.size, tr.doc.content.size)
  tr.setSelection(TextSelection.create(tr.doc, mappedPos, selectionTo))
  tr.scrollIntoView()
  view.dispatch(tr)
  return { from: mappedPos, to: selectionTo }
}

export function selectionHasSuggestions(state: EditorState, from: number, to: number): boolean {
  if (from === to) return false
  const addMark = state.schema.marks.suggestion_add
  const delMark = state.schema.marks.suggestion_del
  if (!addMark && !delMark) return false

  const range = normalizeRange({ from, to })
  let found = false

  state.doc.nodesBetween(range.from, range.to, (node) => {
    if (!node.isInline || node.marks.length === 0) return
    if (node.marks.some(mark => mark.type === addMark || mark.type === delMark)) {
      found = true
      return false
    }
  })

  return found
}

export function acceptSuggestions(editor: Editor, range?: Range): boolean {
  return applySuggestions(editor, range, 'accept')
}

export function rejectSuggestions(editor: Editor, range?: Range): boolean {
  return applySuggestions(editor, range, 'reject')
}

function applySuggestions(editor: Editor, range: Range | undefined, mode: 'accept' | 'reject'): boolean {
  const { state, view } = editor
  const addMark = state.schema.marks.suggestion_add
  const delMark = state.schema.marks.suggestion_del
  if (!addMark && !delMark) return false

  const targetRange = resolveRange(state, range)
  let tr = state.tr

  if (mode === 'accept') {
    if (addMark) {
      tr = tr.removeMark(targetRange.from, targetRange.to, addMark)
    }
    if (delMark) {
      const ranges = collectMarkRanges(state, delMark, targetRange)
      for (let i = ranges.length - 1; i >= 0; i -= 1) {
        tr = tr.delete(ranges[i].from, ranges[i].to)
      }
    }
  } else {
    if (delMark) {
      tr = tr.removeMark(targetRange.from, targetRange.to, delMark)
    }
    if (addMark) {
      const ranges = collectMarkRanges(state, addMark, targetRange)
      for (let i = ranges.length - 1; i >= 0; i -= 1) {
        tr = tr.delete(ranges[i].from, ranges[i].to)
      }
    }
  }

  if (!tr.docChanged) return false
  tr.scrollIntoView()
  view.dispatch(tr)
  return true
}

function buildSegments(originalText: string, suggestedText: string): SuggestionSegment[] {
  if (!originalText && suggestedText) {
    return [{ type: 'add', text: suggestedText }]
  }
  if (originalText && !suggestedText) {
    return [{ type: 'del', text: originalText }]
  }

  const originalTokens = tokenize(originalText)
  const suggestedTokens = tokenize(suggestedText)

  if (originalTokens.length === 0 && suggestedTokens.length === 0) return []
  if (originalTokens.length === 0) return [{ type: 'add', text: suggestedTokens.join('') }]
  if (suggestedTokens.length === 0) return [{ type: 'del', text: originalTokens.join('') }]

  const cellCount = originalTokens.length * suggestedTokens.length
  if (cellCount > MAX_DIFF_CELLS) {
    return buildFallbackSegments(originalTokens, suggestedTokens)
  }

  return diffTokens(originalTokens, suggestedTokens)
}

function buildFallbackSegments(originalTokens: string[], suggestedTokens: string[]): SuggestionSegment[] {
  const segments: SuggestionSegment[] = []
  if (originalTokens.length > 0) {
    segments.push({ type: 'del', text: originalTokens.join('') })
  }
  if (suggestedTokens.length > 0) {
    segments.push({ type: 'add', text: suggestedTokens.join('') })
  }
  return segments
}

function diffTokens(originalTokens: string[], suggestedTokens: string[]): SuggestionSegment[] {
  const rows = originalTokens.length + 1
  const cols = suggestedTokens.length + 1
  const table = new Uint32Array(rows * cols)

  for (let i = originalTokens.length - 1; i >= 0; i -= 1) {
    const rowOffset = i * cols
    const nextRowOffset = (i + 1) * cols
    for (let j = suggestedTokens.length - 1; j >= 0; j -= 1) {
      if (originalTokens[i] === suggestedTokens[j]) {
        table[rowOffset + j] = table[nextRowOffset + j + 1] + 1
      } else {
        const skipOriginal = table[nextRowOffset + j]
        const skipSuggested = table[rowOffset + j + 1]
        table[rowOffset + j] = skipOriginal >= skipSuggested ? skipOriginal : skipSuggested
      }
    }
  }

  const segments: SuggestionSegment[] = []
  const pushSegment = (type: SuggestionSegment['type'], text: string) => {
    if (!text) return
    const last = segments[segments.length - 1]
    if (last && last.type === type) {
      last.text += text
    } else {
      segments.push({ type, text })
    }
  }

  let i = 0
  let j = 0
  while (i < originalTokens.length && j < suggestedTokens.length) {
    if (originalTokens[i] === suggestedTokens[j]) {
      pushSegment('equal', originalTokens[i])
      i += 1
      j += 1
      continue
    }

    const skipOriginal = table[(i + 1) * cols + j]
    const skipSuggested = table[i * cols + j + 1]
    if (skipOriginal >= skipSuggested) {
      pushSegment('del', originalTokens[i])
      i += 1
    } else {
      pushSegment('add', suggestedTokens[j])
      j += 1
    }
  }

  while (i < originalTokens.length) {
    pushSegment('del', originalTokens[i])
    i += 1
  }
  while (j < suggestedTokens.length) {
    pushSegment('add', suggestedTokens[j])
    j += 1
  }

  return segments
}

function buildInlineFragment(
  schema: Schema,
  segments: SuggestionSegment[],
  addMark: MarkType,
  delMark: MarkType | null,
): Fragment {
  const nodes: ProseMirrorNode[] = []
  const hardBreak = schema.nodes.hard_break
  const allowHardBreakMarks = hardBreak ? hardBreak.spec.marks !== '' : false

  segments.forEach((segment) => {
    if (!segment.text) return
    const markType = segment.type === 'add' ? addMark : segment.type === 'del' ? delMark : null
    const marks = markType ? [markType.create()] : []
    const parts = segment.text.split('\n')

    parts.forEach((part, index) => {
      if (part) {
        nodes.push(schema.text(part, marks))
      }
      if (index < parts.length - 1) {
        if (hardBreak) {
          const hardBreakMarks = allowHardBreakMarks ? marks : []
          nodes.push(hardBreak.create(null, null, hardBreakMarks))
        } else {
          nodes.push(schema.text('\n', marks))
        }
      }
    })
  })

  return Fragment.fromArray(nodes)
}

function collectMarkRanges(state: EditorState, markType: MarkType, range: Range): Range[] {
  const ranges: Range[] = []

  state.doc.nodesBetween(range.from, range.to, (node, pos) => {
    if (!node.isInline) return
    if (!node.marks.some(mark => mark.type === markType)) return

    const from = Math.max(range.from, pos)
    const to = Math.min(range.to, pos + node.nodeSize)
    if (from < to) {
      ranges.push({ from, to })
    }
  })

  if (ranges.length <= 1) return ranges
  ranges.sort((a, b) => a.from - b.from)

  const merged: Range[] = [ranges[0]]
  for (let i = 1; i < ranges.length; i += 1) {
    const last = merged[merged.length - 1]
    const current = ranges[i]
    if (current.from <= last.to) {
      last.to = Math.max(last.to, current.to)
    } else {
      merged.push({ ...current })
    }
  }

  return merged
}

function resolveRange(state: EditorState, range?: Range): Range {
  if (!range) {
    range = { from: state.selection.from, to: state.selection.to }
  }
  if (range.from === range.to) {
    return { from: 0, to: state.doc.content.size }
  }
  return normalizeRange(range)
}

function normalizeRange(range: Range): Range {
  return range.from <= range.to ? range : { from: range.to, to: range.from }
}

function clampPosition(pos: number, max: number): number {
  if (pos < 0) return 0
  if (pos > max) return max
  return pos
}

function tokenize(text: string): string[] {
  const tokens: string[] = []
  let buffer = ''
  let mode: 'word' | 'space' | null = null

  const flush = () => {
    if (buffer) {
      tokens.push(buffer)
      buffer = ''
      mode = null
    }
  }

  for (const char of text) {
    if (char === '\n') {
      flush()
      tokens.push(char)
      continue
    }

    if (isWhitespace(char)) {
      if (mode !== 'space') {
        flush()
        mode = 'space'
      }
      buffer += char
      continue
    }

    if (isCjk(char)) {
      flush()
      tokens.push(char)
      continue
    }

    if (isWordChar(char)) {
      if (mode !== 'word') {
        flush()
        mode = 'word'
      }
      buffer += char
      continue
    }

    flush()
    tokens.push(char)
  }

  flush()
  return tokens
}

function isWhitespace(char: string): boolean {
  return char !== '\n' && /\s/.test(char)
}

function isWordChar(char: string): boolean {
  return /\w/.test(char)
}

function isCjk(char: string): boolean {
  const code = char.codePointAt(0)
  if (code === undefined) return false
  return (
    (code >= 0x4E00 && code <= 0x9FFF)
    || (code >= 0x3400 && code <= 0x4DBF)
    || (code >= 0xF900 && code <= 0xFAFF)
  )
}
