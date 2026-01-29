import type { CreateRelationshipDto, Relationship } from '@/lib/supabase/sdk/types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { relationshipsApi } from '@/lib/supabase/sdk/relationships'

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

export type CharacterPanelViewMode = 'overview' | 'relationship'
export type RelationshipGraphViewMode = 'force' | 'dialogue' | 'chord'

export function getCharacterColor(character: { id: string, color?: string | null }) {
  if (character.color) return character.color
  const palette = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']
  let hash = 0
  for (let i = 0; i < character.id.length; i += 1) {
    hash = character.id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}

export function formatRelationshipLabel(relationship: {
  sourceToTargetLabel?: string | null
  targetToSourceLabel?: string | null
}) {
  const a = (relationship.sourceToTargetLabel ?? '').trim()
  const b = (relationship.targetToSourceLabel ?? '').trim()
  if (a && b) return `${a} · ${b}`
  return a || b || '关系'
}

interface CharacterGraphStoreState {
  viewMode: CharacterPanelViewMode
  relationshipGraphViewMode: RelationshipGraphViewMode

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

  setViewMode: (mode: CharacterPanelViewMode) => void
  setRelationshipGraphViewMode: (mode: RelationshipGraphViewMode) => void
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

export const useCharacterGraphStore = create<CharacterGraphStoreState>()(
  devtools(
    (set, _get) => ({
      viewMode: 'overview',
      relationshipGraphViewMode: 'force',
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

      setViewMode: mode => set({ viewMode: mode }),
      setRelationshipGraphViewMode: mode => set({ relationshipGraphViewMode: mode }),
      setSearch: value => set({ search: value }),

      selectCharacter: id => set({ selectedCharacterId: id ?? null, selectedRelationshipId: null }),
      selectRelationship: id => set({ selectedRelationshipId: id ?? null, selectedCharacterId: null }),

      openCreateCharacter: () => set({ characterModalOpen: true, editingCharacterId: null }),
      openEditCharacter: id => set({ characterModalOpen: true, editingCharacterId: id, selectedCharacterId: id }),
      closeCharacterModal: () => set({ characterModalOpen: false, editingCharacterId: null }),

      openCreateRelationship: defaults => set({
        relationshipModalOpen: true,
        editingRelationshipId: null,
        defaultRelationshipSourceId: defaults?.sourceId ?? null,
        defaultRelationshipTargetId: defaults?.targetId ?? null,
      }),
      openEditRelationship: id => set({
        relationshipModalOpen: true,
        editingRelationshipId: id,
        selectedRelationshipId: id,
        defaultRelationshipSourceId: null,
        defaultRelationshipTargetId: null,
      }),
      closeRelationshipModal: () => set({
        relationshipModalOpen: false,
        editingRelationshipId: null,
        defaultRelationshipSourceId: null,
        defaultRelationshipTargetId: null,
      }),

      startLink: sourceId => set({ linkingSourceId: sourceId }),
      cancelLink: () => set({ linkingSourceId: null }),

      setRelationships: (novelId: string, relationships: Relationship[]) => {
        if (!novelId || novelId === 'undefined' || novelId === 'null') return
        set(state => ({
          relationshipsByNovel: { ...state.relationshipsByNovel, [novelId]: relationships },
          relationshipsLoading: false,
          relationshipsError: null,
        }))
      },

      loadRelationships: async (novelId: string, options) => {
        if (!novelId || novelId === 'undefined' || novelId === 'null') {
          set({ relationshipsLoading: false })
          return
        }

        const force = options?.force ?? false
        const cached = _get().relationshipsByNovel[novelId]
        if (!force && Array.isArray(cached)) {
          return
        }

        set({ relationshipsLoading: true, relationshipsError: null })
        try {
          const relationships = await relationshipsApi.getByNovelId(novelId)
          set(state => ({
            relationshipsByNovel: { ...state.relationshipsByNovel, [novelId]: relationships },
            relationshipsLoading: false,
          }))
        } catch (error) {
          console.error('Failed to load relationships:', error)
          set({
            relationshipsLoading: false,
            relationshipsError: error instanceof Error ? error.message : 'Failed to load relationships',
          })
        }
      },

      createRelationship: async (data: CreateRelationshipDto) => {
        const created = await relationshipsApi.create(data)
        set(state => ({
          relationshipsByNovel: {
            ...state.relationshipsByNovel,
            [data.novel_id]: [...(state.relationshipsByNovel[data.novel_id] ?? []), created],
          },
        }))
        return created
      },

      updateRelationship: async (id: string, updates: Partial<Relationship> & { novel_id: string }) => {
        const updated = await relationshipsApi.update(id, updates)
        set(state => ({
          relationshipsByNovel: {
            ...state.relationshipsByNovel,
            [updates.novel_id]: (state.relationshipsByNovel[updates.novel_id] ?? []).map(item =>
              item.id === id ? { ...item, ...updates } : item,
            ),
          },
        }))
        return updated
      },

      deleteRelationship: async (id: string, novelId: string) => {
        await relationshipsApi.delete(id, novelId)
        set(state => ({
          relationshipsByNovel: {
            ...state.relationshipsByNovel,
            [novelId]: (state.relationshipsByNovel[novelId] ?? []).filter(item => item.id !== id),
          },
        }))
      },
    }),
    { name: 'characterGraphStore' },
  ),
)
