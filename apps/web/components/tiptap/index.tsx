// =============================================================================
// Modes — 按场景选择编辑器
// =============================================================================

export { ChapterEditor, TiptapEditor } from './modes/chapter-editor'
export { PlanEditor } from './modes/plan-editor'
export { LiteEditor } from './modes/lite-editor'

// =============================================================================
// Core
// =============================================================================

export { createNovelEditorExtensions, PROSE_MIRROR_CLASS } from './core/create-novel-editor'
export {
  EditorBridgeProvider,
  emitGlobalAiInsert,
  emitGlobalEditorHighlight,
  emitGlobalEditorReady,
  emitGlobalInsertImage,
  subscribeGlobalAiInsert,
  subscribeGlobalEditorHighlight,
  subscribeGlobalEditorReady,
  subscribeGlobalInsertImage,
  useEditorBridge,
  useOptionalEditorBridge,
} from './core/editor-context'
export { EditorShell } from './core/editor-shell'
export { calculateEditorStats } from './core/calculate-stats'
export type {
  ChapterEditorProps,
  EditorAiInsertPayload,
  EditorHighlightPayload,
  EditorInsertImagePayload,
  EditorReadyPayload,
  LiteEditorProps,
  NovelEditorBaseProps,
  NovelEditorMode,
  NovelEditorStats,
  PlanEditorProps,
  TiptapEditorProps,
  TiptapEditorStats,
} from './core/types'

// =============================================================================
// Extensions
// =============================================================================

export * from './extensions/novel'
export * from './extensions/ai'
export * from './extensions/character'

// =============================================================================
// Hooks
// =============================================================================

export { useAutoSave } from './hooks/use-auto-save'
export { useCharacterBridge } from './hooks/use-character-bridge'
export { useEditorBridgeEvents, useEditorImageBindings, useEditorSearchShortcut } from './hooks/use-editor-bridge-events'
export { useEditorContentSync } from './hooks/use-editor-content-sync'
export { useNovelEditor } from './hooks/use-novel-editor'
export { useProposeEditBridge } from './hooks/use-propose-edit-bridge'

// =============================================================================
// UI
// =============================================================================

export { DragHandle } from './ui/drag-handle'
export { FloatingMenu } from './ui/floating-menu'
export { SearchBox } from './ui/search-box'
export { ProposeEditToolbar } from './ui/propose-edit-toolbar'
export { DialogProvider, useDialog } from './ui/dialog-manager'
