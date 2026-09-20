import type { PlanFile } from '@/lib/supabase/sdk'
import { removeIdFromArray } from '../../utils'
import type { StoreGet, StoreSet } from '../../store.types'
import type { PlanStore } from './plan.types'
import type { PlanActions } from './plan.types'

function sortByOrderIndex(items: PlanFile[]): PlanFile[] {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

export function createPlanActions(set: StoreSet<PlanStore>, _get: StoreGet<PlanStore>): PlanActions {
  return {
    hydrate: (novelId, files) => {
      set((state) => {
        state.plan.currentNovelId = novelId
        state.plan.planFilesById = {}
        state.plan.planFileIdsOrdered = []
        for (const file of sortByOrderIndex(files)) {
          state.plan.planFilesById[file.id] = file
          state.plan.planFileIdsOrdered.push(file.id)
        }
        state.plan.hydrated = true
      }, false, 'plan/hydrate')
    },

    resetForNovel: (novelId) => {
      set((state) => {
        if (state.plan.currentNovelId === novelId) return
        state.plan.currentNovelId = novelId
        state.plan.planFilesById = {}
        state.plan.planFileIdsOrdered = []
        state.plan.hydrated = false
        state.plan.selectedPlanFileId = null
      }, false, 'plan/resetForNovel')
    },

    upsertPlanFile: (file) => {
      set((state) => {
        const exists = !!state.plan.planFilesById[file.id]
        state.plan.planFilesById[file.id] = file
        if (!exists) {
          state.plan.planFileIdsOrdered.push(file.id)
          state.plan.planFileIdsOrdered.sort(
            (a, b) => (state.plan.planFilesById[a]?.order_index ?? 0) - (state.plan.planFilesById[b]?.order_index ?? 0),
          )
        }
      }, false, 'plan/upsertPlanFile')
    },

    removePlanFile: (id) => {
      set((state) => {
        delete state.plan.planFilesById[id]
        removeIdFromArray(state.plan.planFileIdsOrdered, id)
        if (state.plan.selectedPlanFileId === id) {
          state.plan.selectedPlanFileId = null
        }
      }, false, 'plan/removePlanFile')
    },

    setSelectedPlanFileId: (id) => {
      set((state) => {
        state.plan.selectedPlanFileId = id
      }, false, 'plan/setSelectedPlanFileId')
    },
  }
}
