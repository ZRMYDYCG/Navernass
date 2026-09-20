import type { StoreGet, StoreSet } from '../../store.types'
import type { AiEditsStore } from './ai-edits.types'
import type { AiEditsActions } from './ai-edits.types'

export function createAiEditsActions(set: StoreSet<AiEditsStore>, _get: StoreGet<AiEditsStore>): AiEditsActions {
  return {
    enqueue: (edit) => {
      set((state) => {
        if (state.aiEdits.edits[edit.id]) return
        state.aiEdits.edits[edit.id] = {
          id: edit.id,
          chapterId: edit.chapterId,
          chapterTitle: edit.chapterTitle,
          originalText: edit.originalText,
          suggestedText: edit.suggestedText,
          reasoning: edit.reasoning,
          offset: edit.offset,
          status: 'pending',
          createdAt: Date.now(),
        }
      }, false, 'aiEdits/enqueue')
    },

    markAnnotated: (id) => {
      set((state) => {
        const e = state.aiEdits.edits[id]
        if (e && e.status !== 'accepted' && e.status !== 'rejected') {
          e.status = 'annotated'
        }
      }, false, 'aiEdits/markAnnotated')
    },

    resolveChapterEdits: (chapterId, resolution) => {
      set((state) => {
        for (const e of Object.values(state.aiEdits.edits)) {
          if (e.chapterId !== chapterId) continue
          if (e.status === 'accepted' || e.status === 'rejected') continue
          e.status = resolution
        }
      }, false, 'aiEdits/resolveChapterEdits')
    },

    requestFocusEdit: (id) => {
      set((state) => {
        state.aiEdits.focusEditId = id
        state.aiEdits.focusRequestSeq += 1
      }, false, 'aiEdits/requestFocusEdit')
    },

    clearFocusEdit: () => {
      set((state) => {
        state.aiEdits.focusEditId = null
      }, false, 'aiEdits/clearFocusEdit')
    },

    removeByChapter: (chapterId) => {
      set((state) => {
        for (const id of Object.keys(state.aiEdits.edits)) {
          if (state.aiEdits.edits[id]?.chapterId === chapterId) {
            delete state.aiEdits.edits[id]
          }
        }
      }, false, 'aiEdits/removeByChapter')
    },

    clear: () => {
      set((state) => {
        state.aiEdits.edits = {}
        state.aiEdits.focusEditId = null
        state.aiEdits.focusRequestSeq = 0
      }, false, 'aiEdits/clear')
    },
  }
}
