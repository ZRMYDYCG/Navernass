import type { AiEditsStore } from './ai-edits.types'
import type { PendingEdit } from './ai-edits.types'

export const selectAiEdits = (state: AiEditsStore) => state.aiEdits
export const selectPendingEdits = (state: AiEditsStore) => state.aiEdits.edits
export const selectFocusEditId = (state: AiEditsStore) => state.aiEdits.focusEditId
export const selectFocusRequestSeq = (state: AiEditsStore) => state.aiEdits.focusRequestSeq
export const selectEditById = (id: string) => (state: AiEditsStore): PendingEdit | undefined =>
  state.aiEdits.edits[id]

/** 选择器：当前章节中尚未标注到编辑器的 edits */
export function selectPendingEditsForChapter(chapterId: string) {
  return (state: AiEditsStore): PendingEdit[] => {
    const out: PendingEdit[] = []
    for (const e of Object.values(state.aiEdits.edits)) {
      if (e.chapterId === chapterId && e.status === 'pending') out.push(e)
    }
    return out.sort((a, b) => a.createdAt - b.createdAt)
  }
}
