// Character Graph Store
export {
  type CharacterGraphCharacter,
  type CharacterGraphRelationship,
  type CharacterPanelViewMode,
  formatRelationshipLabel,
  getCharacterColor,
  type RelationshipGraphViewMode,
  useCharacterGraphStore,
} from './modules/character-graph-store'

// Character Material Store
export {
  useCharacterMaterialStore,
} from './modules/character-material-store'

// Chapters Store (zustand + immer)
export {
  selectOrderedChapters,
  selectOrderedVolumes,
  useChaptersStore,
} from './modules/chapters-store'

// AI Pending Edits Store (zustand + immer)
export {
  type PendingEdit,
  selectPendingEditsForChapter,
  useAiEditsStore,
} from './modules/ai-edits-store'

// Plan Store (zustand + immer)
export {
  selectOrderedPlanFiles,
  usePlanStore,
} from './modules/plan-store'

// Worldview Store (zustand + immer)
export {
  selectOrderedOutlines,
  selectOrderedWorldbookEntries,
  useWorldviewStore,
} from './modules/worldview-store'

// Character Timeline Store (zustand + immer)
export {
  selectEventsForCharacter,
  useTimelineStore,
} from './modules/timeline-store'

// Novel Chat Store (zustand + immer) — per-novel AI session UI state
export {
  selectNovelChatUiSession,
  useNovelChatStore,
  type NovelChatSelectedChapter,
  type NovelChatUiSession,
} from './modules/novel-chat-store'
