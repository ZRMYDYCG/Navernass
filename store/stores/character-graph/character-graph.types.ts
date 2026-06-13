import type { CreateRelationshipDto, Relationship } from '@/lib/supabase/sdk/types'

export interface CharacterGraphCharacter {
  id: string
  name: string
  avatar?: string | null
  role?: string | null
  description?: string | null
  first_appearance?: string | null
  traits?: string[] | null
  keywords?: string[] | null
  note?: string | null
  color?: string | null
}

export interface CharacterGraphRelationship {
  id: string
  sourceId: string
  targetId: string
  sourceToTargetLabel: string
  targetToSourceLabel: string
  note?: string | null
}

export type CharacterPanelViewMode = 'overview' | 'relationship' | 'castingPool'
export type RelationshipGraphViewMode = 'force' | 'dialogue' | 'chord'

export type CharacterGraphState = {
  viewMode: CharacterPanelViewMode
  relationshipGraphViewMode: RelationshipGraphViewMode

  selectedChapterId: string | null
  chapterCharacterPreviewChapterId: string | null

  search: string

  selectedCharacterId: string | null
  selectedRelationshipId: string | null

  characterModalOpen: boolean
  editingCharacterId: string | null

  relationshipModalOpen: boolean
  editingRelationshipId: string | null
  defaultRelationshipSourceId: string | null
  defaultRelationshipTargetId: string | null

  linkingSourceId: string | null

  relationshipsByNovel: Record<string, Relationship[]>
  relationshipsLoading: boolean
  relationshipsError: string | null
}

export type CharacterGraphActions = {
  setViewMode: (mode: CharacterPanelViewMode) => void
  setRelationshipGraphViewMode: (mode: RelationshipGraphViewMode) => void
  setSelectedChapterId: (id?: string | null) => void
  setChapterCharacterPreview: (chapterId?: string | null) => void
  toggleChapterCharacterPreview: (chapterId: string) => void
  setSearch: (value: string) => void

  selectCharacter: (id?: string | null) => void
  selectRelationship: (id?: string | null) => void

  openCreateCharacter: () => void
  openEditCharacter: (id: string) => void
  closeCharacterModal: () => void

  openCreateRelationship: (defaults?: { sourceId?: string | null, targetId?: string | null }) => void
  openEditRelationship: (id: string) => void
  closeRelationshipModal: () => void

  startLink: (sourceId: string) => void
  cancelLink: () => void

  loadRelationships: (novelId: string, options?: { force?: boolean }) => Promise<void>
  setRelationships: (novelId: string, relationships: Relationship[]) => void
  createRelationship: (data: CreateRelationshipDto) => Promise<Relationship>
  updateRelationship: (id: string, updates: Partial<Relationship> & { novel_id: string }) => Promise<Relationship>
  deleteRelationship: (id: string, novelId: string) => Promise<void>
}

export type CharacterGraphStore = {
  characterGraph: CharacterGraphState
  characterGraphActions: CharacterGraphActions
}
