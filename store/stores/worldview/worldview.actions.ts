import type { Outline, WorldbookEntry } from '@/lib/supabase/sdk'
import { removeIdFromArray } from '../../utils'
import type { StoreGet, StoreSet } from '../../store.types'
import type { WorldviewStore } from './worldview.types'
import type { WorldviewActions } from './worldview.types'

function sortByOrderIndex<T extends { order_index: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

export function createWorldviewActions(set: StoreSet<WorldviewStore>, _get: StoreGet<WorldviewStore>): WorldviewActions {
  return {
    hydrateWorldbook: (novelId, entries) => {
      set((state) => {
        state.worldview.currentNovelId = novelId
        state.worldview.worldbookById = {}
        state.worldview.worldbookIdsOrdered = []
        for (const e of sortByOrderIndex(entries)) {
          state.worldview.worldbookById[e.id] = e
          state.worldview.worldbookIdsOrdered.push(e.id)
        }
        state.worldview.worldbookHydrated = true
      }, false, 'worldview/hydrateWorldbook')
    },

    hydrateOutlines: (novelId, outlines) => {
      set((state) => {
        state.worldview.currentNovelId = novelId
        state.worldview.outlinesById = {}
        state.worldview.outlineIdsOrdered = []
        for (const o of sortByOrderIndex(outlines)) {
          state.worldview.outlinesById[o.id] = o
          state.worldview.outlineIdsOrdered.push(o.id)
        }
        state.worldview.outlinesHydrated = true
      }, false, 'worldview/hydrateOutlines')
    },

    resetForNovel: (novelId) => {
      set((state) => {
        if (state.worldview.currentNovelId === novelId) return
        state.worldview.currentNovelId = novelId
        state.worldview.worldbookById = {}
        state.worldview.worldbookIdsOrdered = []
        state.worldview.worldbookHydrated = false
        state.worldview.outlinesById = {}
        state.worldview.outlineIdsOrdered = []
        state.worldview.outlinesHydrated = false
      }, false, 'worldview/resetForNovel')
    },

    upsertWorldbookEntry: (entry) => {
      set((state) => {
        const exists = state.worldview.worldbookById[entry.id]
        state.worldview.worldbookById[entry.id] = entry
        if (!exists) state.worldview.worldbookIdsOrdered.push(entry.id)
        state.worldview.worldbookIdsOrdered.sort((a, b) => {
          const oa = state.worldview.worldbookById[a]?.order_index ?? 0
          const ob = state.worldview.worldbookById[b]?.order_index ?? 0
          return oa - ob
        })
      }, false, 'worldview/upsertWorldbookEntry')
    },

    removeWorldbookEntry: (id) => {
      set((state) => {
        delete state.worldview.worldbookById[id]
        removeIdFromArray(state.worldview.worldbookIdsOrdered, id)
      }, false, 'worldview/removeWorldbookEntry')
    },

    upsertOutline: (outline) => {
      set((state) => {
        const exists = state.worldview.outlinesById[outline.id]
        state.worldview.outlinesById[outline.id] = outline
        if (!exists) state.worldview.outlineIdsOrdered.push(outline.id)
        state.worldview.outlineIdsOrdered.sort((a, b) => {
          const oa = state.worldview.outlinesById[a]?.order_index ?? 0
          const ob = state.worldview.outlinesById[b]?.order_index ?? 0
          return oa - ob
        })
      }, false, 'worldview/upsertOutline')
    },

    removeOutline: (id) => {
      set((state) => {
        delete state.worldview.outlinesById[id]
        removeIdFromArray(state.worldview.outlineIdsOrdered, id)
      }, false, 'worldview/removeOutline')
    },
  }
}
