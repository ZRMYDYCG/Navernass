import type { NovelCharacter } from '@/lib/supabase/sdk'

export type NovelEditorMode = 'chapter' | 'plan' | 'lite'

export interface NovelEditorStats {
  words: number
  characters: number
}

export interface NovelEditorBaseProps {
  content?: string
  placeholder?: string
  onUpdate?: (content: string) => void
  onStatsChange?: (stats: NovelEditorStats) => void
  autoSave?: boolean
  autoSaveDelay?: number
  className?: string
  editable?: boolean
}

export interface ChapterEditorProps extends NovelEditorBaseProps {
  chapterId?: string
  characters?: NovelCharacter[]
  /** 是否启用 AI extension pack（续写、slash AI、修订 track） */
  enableAi?: boolean
}

export interface PlanEditorProps extends NovelEditorBaseProps {
  planFileId?: string
  enableAi?: boolean
}

export type LiteEditorProps = NovelEditorBaseProps

/** @deprecated 使用 ChapterEditorProps */
export type TiptapEditorProps = ChapterEditorProps

/** @deprecated 使用 NovelEditorStats */
export type TiptapEditorStats = NovelEditorStats

export interface EditorHighlightPayload {
  chapterId: string | null
  keyword: string | null
  matches: Array<{ start: number, end: number, type: 'title' | 'content' }>
}

export interface EditorInsertImagePayload {
  imageUrl: string
  chapterId?: string
}

export interface EditorReadyPayload {
  chapterId: string
}

export interface EditorAiInsertPayload {
  text: string
}
