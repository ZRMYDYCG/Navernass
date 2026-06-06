import type { AppStore } from '../../store.types'
import type { PendingEdit } from './ai-edits.types'

export const selectAiEdits = (state: AppStore) => state.aiEdits
export const selectPendingEdits = (state: AppStore) => state.aiEdits.edits
export const selectFocusEditId = (state: AppStore) => state.aiEdits.focusEditId
export const selectFocusRequestSeq = (state: AppStore) => state.aiEdits.focusRequestSeq
export const selectEditById = (id: string) => (state: AppStore): PendingEdit | undefined =>
  state.aiEdits.edits[id]

/** 选择器：当前章节中尚未标注到编辑器的 edits */
export function selectPendingEditsForChapter(chapterId: string) {
  return (state: AppStore): PendingEdit[] => {
    const out: PendingEdit[] = []
    for (const e of Object.values(state.aiEdits.edits)) {
      if (e.chapterId === chapterId && e.status === 'pending') out.push(e)
    }
    return out.sort((a, b) => a.createdAt - b.createdAt)
  }
}
