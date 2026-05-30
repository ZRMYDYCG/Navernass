import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type PendingEditStatus = 'pending' | 'annotated' | 'accepted' | 'rejected'

/**
 * AI 待应用编辑队列
 */
export interface PendingEdit {
  id: string
  chapterId: string
  chapterTitle?: string
  originalText: string
  suggestedText: string
  reasoning?: string
  /** 服务端校验时在 plain 文本中的偏移，用于模糊定位 */
  offset?: number
  status: PendingEditStatus
  createdAt: number
}

interface AiEditsStoreState {
  edits: Record<string, PendingEdit>
  /** 用户点击手术刀卡片后待定位的 edit id */
  focusEditId: string | null
  /** 递增以支持重复点击同一条 edit */
  focusRequestSeq: number
  enqueue: (edit: Omit<PendingEdit, 'status' | 'createdAt'>) => void
  markAnnotated: (id: string) => void
  resolveChapterEdits: (chapterId: string, resolution: 'accepted' | 'rejected') => void
  requestFocusEdit: (id: string) => void
  clearFocusEdit: () => void
  removeByChapter: (chapterId: string) => void
  clear: () => void
}

export const useAiEditsStore = create<AiEditsStoreState>()(
  devtools(
    immer<AiEditsStoreState>(set => ({
      edits: {},
      focusEditId: null,
      focusRequestSeq: 0,

      enqueue: edit => set((state) => {
        if (state.edits[edit.id]) return
        state.edits[edit.id] = {
          ...edit,
          status: 'pending',
          createdAt: Date.now(),
        }
      }),

      markAnnotated: id => set((state) => {
        const e = state.edits[id]
        if (e && e.status !== 'accepted' && e.status !== 'rejected') {
          e.status = 'annotated'
        }
      }),

      resolveChapterEdits: (chapterId, resolution) => set((state) => {
        for (const e of Object.values(state.edits)) {
          if (e.chapterId !== chapterId) continue
          if (e.status === 'accepted' || e.status === 'rejected') continue
          e.status = resolution
        }
      }),

      requestFocusEdit: id => set((state) => {
        state.focusEditId = id
        state.focusRequestSeq += 1
      }),

      clearFocusEdit: () => set((state) => {
        state.focusEditId = null
      }),

      removeByChapter: chapterId => set((state) => {
        for (const id of Object.keys(state.edits)) {
          if (state.edits[id]?.chapterId === chapterId) {
            delete state.edits[id]
          }
        }
      }),

      clear: () => set((state) => {
        state.edits = {}
        state.focusEditId = null
        state.focusRequestSeq = 0
      }),
    })),
    { name: 'aiEditsStore' },
  ),
)

/** 选择器：当前章节中尚未标注到编辑器的 edits */
export function selectPendingEditsForChapter(chapterId: string) {
  return (state: AiEditsStoreState) => {
    const out: PendingEdit[] = []
    for (const e of Object.values(state.edits)) {
      if (e.chapterId === chapterId && e.status === 'pending') out.push(e)
    }
    return out.sort((a, b) => a.createdAt - b.createdAt)
  }
}
