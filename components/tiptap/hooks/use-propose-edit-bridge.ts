import type { Editor } from '@tiptap/react'
import { useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { locateTextInEditor, scrollEditorToRange } from '@/lib/editor/locate-text-in-editor'
import type { PendingEdit } from '@/store'
import { useAiEditsStore } from '@/store'
import {
  applySuggestionDiff,
  documentHasSuggestions,
  findDocumentSuggestionRange,
} from '@/components/tiptap/extensions/ai/suggestion-track'

interface UseProposeEditBridgeOptions {
  isReady?: boolean
  chapterHtml?: string
}

export function useProposeEditBridge(
  editor: Editor | null,
  chapterId?: string,
  options: UseProposeEditBridgeOptions = {},
) {
  const { isReady = true, chapterHtml } = options
  const editsMap = useAiEditsStore(s => s.aiEdits.edits)
  const focusEditId = useAiEditsStore(s => s.aiEdits.focusEditId)
  const focusRequestSeq = useAiEditsStore(s => s.aiEdits.focusRequestSeq)
  const markAnnotated = useAiEditsStore(s => s.aiEditsActions.markAnnotated)
  const clearFocusEdit = useAiEditsStore(s => s.aiEditsActions.clearFocusEdit)

  const pendingEdits = useMemo(() => {
    if (!chapterId) return []
    return Object.values(editsMap)
      .filter(e => e.chapterId === chapterId && e.status === 'pending')
      .sort((a, b) => a.createdAt - b.createdAt)
  }, [editsMap, chapterId])

  const focusEdit = focusEditId ? editsMap[focusEditId] : undefined
  const processedFocusRef = useRef<string | null>(null)

  useEffect(() => {
    processedFocusRef.current = null
  }, [focusEditId, focusRequestSeq, chapterId])

  useEffect(() => {
    if (!editor || !chapterId || !isReady) return

    if (focusEdit?.chapterId === chapterId && focusEditId) {
      const focusKey = `${focusEditId}:${focusRequestSeq}`
      if (processedFocusRef.current === focusKey) return
      processedFocusRef.current = focusKey

      const result = focusEditInEditor(editor, focusEdit, chapterHtml)

      if (result === 'scrolled') {
        clearFocusEdit()
        if (focusEdit.status === 'pending') markAnnotated(focusEdit.id)
        toast.success('已定位到修改位置', {
          description: focusEdit.reasoning || '请审阅后接受或拒绝',
        })
        return
      }

      if (result === 'applied') {
        clearFocusEdit()
        markAnnotated(focusEdit.id)
        toast.success('已定位到修改位置', {
          description: focusEdit.reasoning || '请审阅后接受或拒绝',
        })
        return
      }

      if (result === 'skipped') {
        clearFocusEdit()
        markAnnotated(focusEdit.id)
        toast.info('修改建议与原文一致，跳过')
        return
      }

      processedFocusRef.current = null
      toast.warning('未能在章节正文中找到匹配片段', {
        description: focusEdit.reasoning,
      })
      return
    }

    if (pendingEdits.length === 0) return

    for (const edit of pendingEdits) {
      if (edit.id === focusEditId) continue

      const result = applyPendingEdit(editor, edit, { scroll: false }, chapterHtml)
      if (result === 'applied') {
        toast.success('AI 修改建议已注入编辑器', {
          description: edit.reasoning || '请审阅后接受或拒绝',
        })
        markAnnotated(edit.id)
      } else if (result === 'skipped') {
        markAnnotated(edit.id)
      }
    }
  }, [
    editor,
    chapterId,
    isReady,
    chapterHtml,
    pendingEdits,
    focusEdit,
    focusEditId,
    focusRequestSeq,
    markAnnotated,
    clearFocusEdit,
  ])
}

type FocusResult = 'scrolled' | 'applied' | 'skipped' | 'not_found'
type ApplyResult = 'applied' | 'skipped' | 'not_found'

function focusEditInEditor(
  editor: Editor,
  edit: PendingEdit,
  chapterHtml?: string,
): FocusResult {
  if (documentHasSuggestions(editor.state)) {
    const suggestionRange = findDocumentSuggestionRange(editor, {
      originalText: edit.originalText,
    })
    if (suggestionRange) {
      scrollEditorToRange(editor, suggestionRange)
      return 'scrolled'
    }
  }

  if (edit.status === 'accepted') {
    if (scrollToNeedle(editor, edit.suggestedText, undefined, chapterHtml)) {
      return 'scrolled'
    }
  }

  if (edit.status === 'rejected' || edit.status === 'accepted' || edit.status === 'annotated') {
    if (scrollToNeedle(editor, edit.originalText, edit.offset, chapterHtml)) {
      return 'scrolled'
    }
  }

  if (edit.status === 'pending') {
    const result = applyPendingEdit(editor, edit, { scroll: true }, chapterHtml)
    if (result === 'applied' || result === 'skipped') return result
  }

  if (scrollToNeedle(editor, edit.originalText, edit.offset, chapterHtml)) {
    return 'scrolled'
  }

  if (edit.suggestedText && scrollToNeedle(editor, edit.suggestedText, undefined, chapterHtml)) {
    return 'scrolled'
  }

  return 'not_found'
}

function scrollToNeedle(
  editor: Editor,
  needle: string | undefined,
  offset: number | undefined,
  chapterHtml?: string,
): boolean {
  if (!needle?.trim()) return false
  const range = locateTextInEditor(editor, needle, offset, chapterHtml)
  if (!range) return false
  scrollEditorToRange(editor, range)
  return true
}

function applyPendingEdit(
  editor: Editor,
  edit: PendingEdit,
  options: { scroll: boolean },
  chapterHtml?: string,
): ApplyResult {
  const range = locateTextInEditor(
    editor,
    edit.originalText,
    edit.offset,
    chapterHtml,
  )
  if (!range) return 'not_found'

  const actualOriginal = editor.state.doc.textBetween(range.from, range.to, '', '')

  if (options.scroll) {
    scrollEditorToRange(editor, range)
  }

  const appliedRange = applySuggestionDiff(
    editor,
    range,
    actualOriginal || edit.originalText,
    edit.suggestedText,
  )

  if (!appliedRange) return 'skipped'
  return 'applied'
}
