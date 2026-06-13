export type PendingEditStatus = 'pending' | 'annotated' | 'accepted' | 'rejected'

/** AI 待应用编辑队列 */
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

export type AiEditsState = {
  edits: Record<string, PendingEdit>
  /** 用户点击手术刀卡片后待定位的 edit id */
  focusEditId: string | null
  /** 递增以支持重复点击同一条 edit */
  focusRequestSeq: number
}

export type AiEditsActions = {
  enqueue: (edit: Omit<PendingEdit, 'status' | 'createdAt'>) => void
  markAnnotated: (id: string) => void
  resolveChapterEdits: (chapterId: string, resolution: 'accepted' | 'rejected') => void
  requestFocusEdit: (id: string) => void
  clearFocusEdit: () => void
  removeByChapter: (chapterId: string) => void
  clear: () => void
}

export type AiEditsStore = {
  aiEdits: AiEditsState
  aiEditsActions: AiEditsActions
}
