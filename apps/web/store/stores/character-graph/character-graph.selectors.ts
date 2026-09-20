import type { Relationship } from '@/lib/supabase/sdk/types'
import type { CharacterGraphStore } from './character-graph.types'

export const selectCharacterGraph = (state: CharacterGraphStore) => state.characterGraph
export const selectCharacterGraphViewMode = (state: CharacterGraphStore) => state.characterGraph.viewMode
export const selectRelationshipGraphViewMode = (state: CharacterGraphStore) => state.characterGraph.relationshipGraphViewMode
export const selectSelectedChapterId = (state: CharacterGraphStore) => state.characterGraph.selectedChapterId
export const selectChapterCharacterPreview = (state: CharacterGraphStore) =>
  state.characterGraph.chapterCharacterPreviewChapterId
export const selectCharacterSearch = (state: CharacterGraphStore) => state.characterGraph.search
export const selectGraphSelectedCharacterId = (state: CharacterGraphStore) => state.characterGraph.selectedCharacterId
export const selectSelectedRelationshipId = (state: CharacterGraphStore) => state.characterGraph.selectedRelationshipId
export const selectCharacterModalOpen = (state: CharacterGraphStore) => state.characterGraph.characterModalOpen
export const selectEditingCharacterId = (state: CharacterGraphStore) => state.characterGraph.editingCharacterId
export const selectRelationshipModalOpen = (state: CharacterGraphStore) => state.characterGraph.relationshipModalOpen
export const selectEditingRelationshipId = (state: CharacterGraphStore) => state.characterGraph.editingRelationshipId
export const selectLinkingSourceId = (state: CharacterGraphStore) => state.characterGraph.linkingSourceId
export const selectRelationshipsByNovel = (state: CharacterGraphStore) => state.characterGraph.relationshipsByNovel
export const selectRelationshipsLoading = (state: CharacterGraphStore) => state.characterGraph.relationshipsLoading
export const selectRelationshipsError = (state: CharacterGraphStore) => state.characterGraph.relationshipsError

export const selectRelationshipsForNovel = (novelId: string) =>
  (state: CharacterGraphStore): Relationship[] => state.characterGraph.relationshipsByNovel[novelId] ?? []
