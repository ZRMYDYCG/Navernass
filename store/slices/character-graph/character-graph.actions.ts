import type { CreateRelationshipDto } from '@/lib/supabase/sdk/types'
import { relationshipsApi } from '@/lib/supabase/sdk/relationships'
import { removeItemById, replaceArrayContents } from '../../utils'
import type { StoreGet, StoreSet } from '../../store.types'
import type { CharacterGraphActions } from './character-graph.types'

function isValidNovelId(novelId: string | null | undefined): novelId is string {
  return !!novelId && novelId !== 'undefined' && novelId !== 'null'
}

export function createCharacterGraphActions(set: StoreSet, get: StoreGet): CharacterGraphActions {
  return {
    setViewMode: (mode) => {
      set((state) => {
        state.characterGraph.viewMode = mode
      }, false, 'characterGraph/setViewMode')
    },

    setRelationshipGraphViewMode: (mode) => {
      set((state) => {
        state.characterGraph.relationshipGraphViewMode = mode
      }, false, 'characterGraph/setRelationshipGraphViewMode')
    },

    setSelectedChapterId: (id) => {
      set((state) => {
        state.characterGraph.selectedChapterId = id ?? null
      }, false, 'characterGraph/setSelectedChapterId')
    },

    setChapterCharacterPreview: (chapterId) => {
      set((state) => {
        state.characterGraph.chapterCharacterPreviewChapterId = chapterId ?? null
      }, false, 'characterGraph/setChapterCharacterPreview')
    },

    toggleChapterCharacterPreview: (chapterId) => {
      set((state) => {
        state.characterGraph.chapterCharacterPreviewChapterId
          = state.characterGraph.chapterCharacterPreviewChapterId === chapterId ? null : chapterId
      }, false, 'characterGraph/toggleChapterCharacterPreview')
    },

    setSearch: (value) => {
      set((state) => {
        state.characterGraph.search = value
      }, false, 'characterGraph/setSearch')
    },

    selectCharacter: (id) => {
      set((state) => {
        state.characterGraph.selectedCharacterId = id ?? null
        state.characterGraph.selectedRelationshipId = null
      }, false, 'characterGraph/selectCharacter')
    },

    selectRelationship: (id) => {
      set((state) => {
        state.characterGraph.selectedRelationshipId = id ?? null
        state.characterGraph.selectedCharacterId = null
      }, false, 'characterGraph/selectRelationship')
    },

    openCreateCharacter: () => {
      set((state) => {
        state.characterGraph.characterModalOpen = true
        state.characterGraph.editingCharacterId = null
      }, false, 'characterGraph/openCreateCharacter')
    },

    openEditCharacter: (id) => {
      set((state) => {
        state.characterGraph.characterModalOpen = true
        state.characterGraph.editingCharacterId = id
        state.characterGraph.selectedCharacterId = id
      }, false, 'characterGraph/openEditCharacter')
    },

    closeCharacterModal: () => {
      set((state) => {
        state.characterGraph.characterModalOpen = false
        state.characterGraph.editingCharacterId = null
      }, false, 'characterGraph/closeCharacterModal')
    },

    openCreateRelationship: (defaults) => {
      set((state) => {
        state.characterGraph.relationshipModalOpen = true
        state.characterGraph.editingRelationshipId = null
        state.characterGraph.defaultRelationshipSourceId = defaults?.sourceId ?? null
        state.characterGraph.defaultRelationshipTargetId = defaults?.targetId ?? null
      }, false, 'characterGraph/openCreateRelationship')
    },

    openEditRelationship: (id) => {
      set((state) => {
        state.characterGraph.relationshipModalOpen = true
        state.characterGraph.editingRelationshipId = id
        state.characterGraph.selectedRelationshipId = id
        state.characterGraph.defaultRelationshipSourceId = null
        state.characterGraph.defaultRelationshipTargetId = null
      }, false, 'characterGraph/openEditRelationship')
    },

    closeRelationshipModal: () => {
      set((state) => {
        state.characterGraph.relationshipModalOpen = false
        state.characterGraph.editingRelationshipId = null
        state.characterGraph.defaultRelationshipSourceId = null
        state.characterGraph.defaultRelationshipTargetId = null
      }, false, 'characterGraph/closeRelationshipModal')
    },

    startLink: (sourceId) => {
      set((state) => {
        state.characterGraph.linkingSourceId = sourceId
      }, false, 'characterGraph/startLink')
    },

    cancelLink: () => {
      set((state) => {
        state.characterGraph.linkingSourceId = null
      }, false, 'characterGraph/cancelLink')
    },

    setRelationships: (novelId, relationships) => {
      if (!isValidNovelId(novelId)) return
      set((state) => {
        if (!state.characterGraph.relationshipsByNovel[novelId]) {
          state.characterGraph.relationshipsByNovel[novelId] = []
        }
        replaceArrayContents(state.characterGraph.relationshipsByNovel[novelId], relationships)
        state.characterGraph.relationshipsLoading = false
        state.characterGraph.relationshipsError = null
      }, false, 'characterGraph/setRelationships')
    },

    loadRelationships: async (novelId, options) => {
      if (!isValidNovelId(novelId)) {
        set((state) => {
          state.characterGraph.relationshipsLoading = false
        }, false, 'characterGraph/loadRelationships:invalidId')
        return
      }

      const force = options?.force ?? false
      const cached = get().characterGraph.relationshipsByNovel[novelId]
      if (!force && Array.isArray(cached)) {
        return
      }

      set((state) => {
        state.characterGraph.relationshipsLoading = true
        state.characterGraph.relationshipsError = null
      }, false, 'characterGraph/loadRelationships:start')

      try {
        const relationships = await relationshipsApi.getByNovelId(novelId)
        set((state) => {
          if (!state.characterGraph.relationshipsByNovel[novelId]) {
            state.characterGraph.relationshipsByNovel[novelId] = []
          }
          replaceArrayContents(state.characterGraph.relationshipsByNovel[novelId], relationships)
          state.characterGraph.relationshipsLoading = false
        }, false, 'characterGraph/loadRelationships:success')
      } catch (error) {
        console.error('Failed to load relationships:', error)
        set((state) => {
          state.characterGraph.relationshipsLoading = false
          state.characterGraph.relationshipsError
            = error instanceof Error ? error.message : 'Failed to load relationships'
        }, false, 'characterGraph/loadRelationships:error')
      }
    },

    createRelationship: async (data: CreateRelationshipDto) => {
      const created = await relationshipsApi.create(data)
      set((state) => {
        if (!state.characterGraph.relationshipsByNovel[data.novel_id]) {
          state.characterGraph.relationshipsByNovel[data.novel_id] = []
        }
        state.characterGraph.relationshipsByNovel[data.novel_id].push(created)
      }, false, 'characterGraph/createRelationship')
      return created
    },

    updateRelationship: async (id, updates) => {
      const updated = await relationshipsApi.update(id, updates)
      set((state) => {
        const list = state.characterGraph.relationshipsByNovel[updates.novel_id]
        if (!list) return
        const index = list.findIndex(item => item.id === id)
        if (index !== -1) list[index] = updated
      }, false, 'characterGraph/updateRelationship')
      return updated
    },

    deleteRelationship: async (id, novelId) => {
      await relationshipsApi.delete(id, novelId)
      set((state) => {
        const list = state.characterGraph.relationshipsByNovel[novelId]
        if (list) removeItemById(list, id)
      }, false, 'characterGraph/deleteRelationship')
    },
  }
}
