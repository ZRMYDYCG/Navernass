import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

/**
 * AI 待应用编辑队列
 *
 * 设计：propose_edit 工具产生的 diff 推到 store；编辑器侧订阅 store，
 * 每当当前章节有新的 pending edit 就尝试 applySuggestionDiff。
 *
 * 与之前"派发 CustomEvent"的差异：
 *   - 事件是瞬时的，派发时编辑器若未挂载就丢了
 *   - store 是持久化的，编辑器挂载后能立即看到所有 pending edits
 *   - 切换章节后回到原章节，未应用的 diff 仍在
 *
 * applied 标记：成功 apply 后置为 true，避免编辑器重复 apply 同一个 edit。
 * 用户保存章节时清空当前章节的所有已应用 edit。
 */

export interface PendingEdit {
  id: string
  chapterId: string
  chapterTitle?: string
  originalText: string
  suggestedText: string
  reasoning?: string
  /** 已经被 applySuggestionDiff 注入到编辑器（成功定位） */
  applied: boolean
  createdAt: number
}

interface AiEditsStoreState {
  edits: Record<string, PendingEdit>
  enqueue: (edit: Omit<PendingEdit, 'applied' | 'createdAt'>) => void
  markApplied: (id: string) => void
  removeByChapter: (chapterId: string) => void
  clear: () => void
}

export const useAiEditsStore = create<AiEditsStoreState>()(
  devtools(
    immer<AiEditsStoreState>(set => ({
      edits: {},

      enqueue: edit => set((state) => {
        if (state.edits[edit.id]) return
        state.edits[edit.id] = {
          ...edit,
          applied: false,
          createdAt: Date.now(),
        }
      }),

      markApplied: id => set((state) => {
        const e = state.edits[id]
        if (e) e.applied = true
      }),

      removeByChapter: chapterId => set((state) => {
        for (const id of Object.keys(state.edits)) {
          if (state.edits[id].chapterId === chapterId) {
            delete state.edits[id]
          }
        }
      }),

      clear: () => set((state) => {
        state.edits = {}
      }),
    })),
    { name: 'aiEditsStore' },
  ),
)

/** 选择器：当前章节中所有未应用的 edits */
export function selectPendingEditsForChapter(chapterId: string) {
  return (state: AiEditsStoreState) => {
    const out: PendingEdit[] = []
    for (const e of Object.values(state.edits)) {
      if (e.chapterId === chapterId && !e.applied) out.push(e)
    }
    return out.sort((a, b) => a.createdAt - b.createdAt)
  }
}
