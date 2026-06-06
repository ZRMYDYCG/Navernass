// =============================================================================
// AI edits
// =============================================================================

export {
  selectAiEdits,
  selectEditById,
  selectFocusEditId,
  selectFocusRequestSeq,
  selectPendingEdits,
  selectPendingEditsForChapter,
} from './slices/ai-edits'
export type { AiEditsActions, AiEditsSlice, AiEditsState, PendingEdit, PendingEditStatus } from './slices/ai-edits'

// =============================================================================
// Chapters
// =============================================================================

export {
  selectChapterById,
  selectChapters,
  selectChaptersCurrentNovelId,
  selectChaptersHydrated,
  selectOrderedChapters,
  selectOrderedVolumes,
  selectVolumeById,
} from './slices/chapters'
export type { ChaptersActions, ChaptersSlice, ChaptersState } from './slices/chapters'

// =============================================================================
// Character graph
// =============================================================================

export {
  selectChapterCharacterPreview,
  selectCharacterGraph,
  selectCharacterGraphViewMode,
  selectCharacterModalOpen,
  selectCharacterSearch,
  selectEditingCharacterId,
  selectEditingRelationshipId,
  selectGraphSelectedCharacterId,
  selectLinkingSourceId,
  selectRelationshipGraphViewMode,
  selectRelationshipModalOpen,
  selectRelationshipsByNovel,
  selectRelationshipsError,
  selectRelationshipsForNovel,
  selectRelationshipsLoading,
  selectSelectedChapterId,
  selectSelectedRelationshipId,
} from './slices/character-graph'
export type {
  CharacterGraphActions,
  CharacterGraphCharacter,
  CharacterGraphRelationship,
  CharacterGraphSlice,
  CharacterGraphState,
  CharacterPanelViewMode,
  RelationshipGraphViewMode,
} from './slices/character-graph'

// =============================================================================
// Character material
// =============================================================================

export {
  selectCharacterChapterIds,
  selectCharacterChapterMap,
  selectCharacterMaterial,
  selectCharacters,
  selectMaterialSelectedCharacterId,
} from './slices/character-material'
export type {
  CharacterMaterialActions,
  CharacterMaterialSlice,
  CharacterMaterialState,
} from './slices/character-material'

// =============================================================================
// Novel chat
// =============================================================================

export {
  selectActiveNovelId,
  selectMountedSessionNovelIds,
  selectNovelChat,
  selectNovelChatUiSession,
  selectUiSessionForNovel,
} from './slices/novel-chat'
export type {
  NovelChatActions,
  NovelChatSelectedChapter,
  NovelChatSelectedCharacter,
  NovelChatSlice,
  NovelChatState,
  NovelChatUiSession,
} from './slices/novel-chat'

// =============================================================================
// Plan
// =============================================================================

export {
  selectOrderedPlanFiles,
  selectPlan,
  selectPlanCurrentNovelId,
  selectPlanFileById,
  selectPlanHydrated,
  selectSelectedPlanFileId,
} from './slices/plan'
export type { PlanActions, PlanSlice, PlanState } from './slices/plan'

// =============================================================================
// Timeline
// =============================================================================

export {
  selectEventById,
  selectEventsForCharacter,
  selectHydratedCharacters,
  selectTimeline,
} from './slices/timeline'
export type { TimelineActions, TimelineSlice, TimelineState } from './slices/timeline'

// =============================================================================
// Worldview
// =============================================================================

export {
  selectOrderedOutlines,
  selectOrderedWorldbookEntries,
  selectOutlineById,
  selectOutlinesHydrated,
  selectWorldbookEntryById,
  selectWorldbookHydrated,
  selectWorldview,
  selectWorldviewCurrentNovelId,
} from './slices/worldview'
export type { WorldviewActions, WorldviewSlice, WorldviewState } from './slices/worldview'

// =============================================================================
// 主 store hook
// =============================================================================

export type { AppStore, StoreGet, StoreSet, StoreSlice } from './store.types'
export { useAppStore } from './use-app-store'

// =============================================================================
// 工具函数
// =============================================================================

export { formatRelationshipLabel, getCharacterColor } from './utils'
