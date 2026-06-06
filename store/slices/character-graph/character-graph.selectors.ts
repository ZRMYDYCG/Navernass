import type { Relationship } from '@/lib/supabase/sdk/types'
import type { AppStore } from '../../store.types'

export const selectCharacterGraph = (state: AppStore) => state.characterGraph
export const selectCharacterGraphViewMode = (state: AppStore) => state.characterGraph.viewMode
export const selectRelationshipGraphViewMode = (state: AppStore) => state.characterGraph.relationshipGraphViewMode
export const selectSelectedChapterId = (state: AppStore) => state.characterGraph.selectedChapterId
export const selectChapterCharacterPreview = (state: AppStore) =>
  state.characterGraph.chapterCharacterPreviewChapterId
export const selectCharacterSearch = (state: AppStore) => state.characterGraph.search
export const selectGraphSelectedCharacterId = (state: AppStore) => state.characterGraph.selectedCharacterId
export const selectSelectedRelationshipId = (state: AppStore) => state.characterGraph.selectedRelationshipId
export const selectCharacterModalOpen = (state: AppStore) => state.characterGraph.characterModalOpen
export const selectEditingCharacterId = (state: AppStore) => state.characterGraph.editingCharacterId
export const selectRelationshipModalOpen = (state: AppStore) => state.characterGraph.relationshipModalOpen
export const selectEditingRelationshipId = (state: AppStore) => state.characterGraph.editingRelationshipId
export const selectLinkingSourceId = (state: AppStore) => state.characterGraph.linkingSourceId
export const selectRelationshipsByNovel = (state: AppStore) => state.characterGraph.relationshipsByNovel
export const selectRelationshipsLoading = (state: AppStore) => state.characterGraph.relationshipsLoading
export const selectRelationshipsError = (state: AppStore) => state.characterGraph.relationshipsError

export const selectRelationshipsForNovel = (novelId: string) =>
  (state: AppStore): Relationship[] => state.characterGraph.relationshipsByNovel[novelId] ?? []
