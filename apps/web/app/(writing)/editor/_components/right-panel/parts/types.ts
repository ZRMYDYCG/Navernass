/**
 * 工具相关的前端共享类型
 *
 * 与 lib/ai/tools/propose-edit.ts 的 execute 返回值保持同构。
 */

export interface ProposeEditOutput {
  ok: boolean
  chapter_id?: string
  chapter_title?: string
  original_text?: string
  suggested_text?: string
  reasoning?: string
  offset?: number
  error?: string
  hint?: string
}

export interface AskUserField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'radio'
  placeholder?: string
  required?: boolean
  options?: { label: string, value: string }[]
}

export interface AskUserOutput {
  ok: boolean
  title?: string
  description?: string
  fields?: AskUserField[]
  error?: string
  /** 该表单是否已由用户提交过（持久化标记） */
  submitted?: boolean
  /** 用户在表单里填写的最终值（持久化，刷新后可恢复显示） */
  submittedValues?: Record<string, string>
}

/** 编辑器联动事件：从 right-panel 触发，由 editor-content 监听 */
export interface ProposeEditEventDetail {
  chapterId: string
  chapterTitle?: string
  originalText: string
  suggestedText: string
  reasoning?: string
}
