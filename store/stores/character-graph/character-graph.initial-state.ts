import type { CharacterGraphState } from './character-graph.types'

export const characterGraphInitialState: CharacterGraphState = {
  viewMode: 'overview',
  relationshipGraphViewMode: 'force',
  selectedChapterId: null,
  chapterCharacterPreviewChapterId: null,
  search: '',
  selectedCharacterId: null,
  selectedRelationshipId: null,

  characterModalOpen: false,
  editingCharacterId: null,

  relationshipModalOpen: false,
  editingRelationshipId: null,
  defaultRelationshipSourceId: null,
  defaultRelationshipTargetId: null,

  linkingSourceId: null,

  relationshipsByNovel: {},
  relationshipsLoading: false,
  relationshipsError: null,
}
