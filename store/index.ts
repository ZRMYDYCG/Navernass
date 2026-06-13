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
  useAiEditsStore,
} from './stores/ai-edits'
export type { AiEditsActions, AiEditsState, AiEditsStore, PendingEdit, PendingEditStatus } from './stores/ai-edits'

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
  useChaptersStore,
} from './stores/chapters'
export type { ChaptersActions, ChaptersState, ChaptersStore } from './stores/chapters'

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
  useCharacterGraphStore,
} from './stores/character-graph'
export type {
  CharacterGraphActions,
  CharacterGraphCharacter,
  CharacterGraphRelationship,
  CharacterGraphState,
  CharacterGraphStore,
  CharacterPanelViewMode,
  RelationshipGraphViewMode,
} from './stores/character-graph'

// =============================================================================
// Character material
// =============================================================================

export {
  selectCharacterChapterIds,
  selectCharacterChapterMap,
  selectCharacterMaterial,
  selectCharacters,
  selectMaterialSelectedCharacterId,
  useCharacterMaterialStore,
} from './stores/character-material'
export type {
  CharacterMaterialActions,
  CharacterMaterialState,
  CharacterMaterialStore,
} from './stores/character-material'

// =============================================================================
// Chat (主聊天页)
// =============================================================================

export {
  selectChat,
  selectChatPendingDraftMessage,
  selectChatStreamingConversationId,
  selectChatWelcomeInput,
  useChatStore,
} from './stores/chat'
export type {
  ChatActions,
  ChatState,
  ChatStore,
} from './stores/chat'

// =============================================================================
// Novel chat
// =============================================================================

export {
  selectActiveNovelId,
  selectMountedSessionNovelIds,
  selectNovelChat,
  selectNovelChatUiSession,
  selectUiSessionForNovel,
  useNovelChatStore,
} from './stores/novel-chat'
export type {
  NovelChatActions,
  NovelChatSelectedChapter,
  NovelChatSelectedCharacter,
  NovelChatState,
  NovelChatStore,
  NovelChatUiSession,
} from './stores/novel-chat'

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
  usePlanStore,
} from './stores/plan'
export type { PlanActions, PlanState, PlanStore } from './stores/plan'

// =============================================================================
// Timeline
// =============================================================================

export {
  selectEventById,
  selectEventsForCharacter,
  selectHydratedCharacters,
  selectTimeline,
  useTimelineStore,
} from './stores/timeline'
export type { TimelineActions, TimelineState, TimelineStore } from './stores/timeline'

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
  useWorldviewStore,
} from './stores/worldview'
export type { WorldviewActions, WorldviewState, WorldviewStore } from './stores/worldview'

// =============================================================================
// Store 基础设施
// =============================================================================

export { createBoundStore } from './create-store'
export type { BoundStoreCreator } from './create-store'
export type { StoreGet, StoreMutators, StoreSet } from './store.types'

// =============================================================================
// 工具函数
// =============================================================================

export { formatRelationshipLabel, getCharacterColor } from './utils'
