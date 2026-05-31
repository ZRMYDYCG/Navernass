import type { PlanFile } from '@/lib/supabase/sdk'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface PlanStoreState {
  currentNovelId: string | null
  planFilesById: Record<string, PlanFile>
  planFileIdsOrdered: string[]
  hydrated: boolean
  selectedPlanFileId: string | null

  hydrate: (novelId: string, files: PlanFile[]) => void
  resetForNovel: (novelId: string) => void
  upsertPlanFile: (file: PlanFile) => void
  removePlanFile: (id: string) => void
  setSelectedPlanFileId: (id: string | null) => void
}

function sortByOrderIndex(items: PlanFile[]): PlanFile[] {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

export const usePlanStore = create<PlanStoreState>()(
  devtools(
    immer<PlanStoreState>(set => ({
      currentNovelId: null,
      planFilesById: {},
      planFileIdsOrdered: [],
      hydrated: false,
      selectedPlanFileId: null,

      hydrate: (novelId, files) => set((state) => {
        state.currentNovelId = novelId
        state.planFilesById = {}
        state.planFileIdsOrdered = []
        for (const file of sortByOrderIndex(files)) {
          state.planFilesById[file.id] = file
          state.planFileIdsOrdered.push(file.id)
        }
        state.hydrated = true
      }),

      resetForNovel: novelId => set((state) => {
        if (state.currentNovelId === novelId) return
        state.currentNovelId = novelId
        state.planFilesById = {}
        state.planFileIdsOrdered = []
        state.hydrated = false
        state.selectedPlanFileId = null
      }),

      upsertPlanFile: file => set((state) => {
        const exists = !!state.planFilesById[file.id]
        state.planFilesById[file.id] = file
        if (!exists) {
          state.planFileIdsOrdered.push(file.id)
          state.planFileIdsOrdered.sort(
            (a, b) => (state.planFilesById[a]?.order_index ?? 0) - (state.planFilesById[b]?.order_index ?? 0),
          )
        }
      }),

      removePlanFile: id => set((state) => {
        delete state.planFilesById[id]
        state.planFileIdsOrdered = state.planFileIdsOrdered.filter(fid => fid !== id)
        if (state.selectedPlanFileId === id) {
          state.selectedPlanFileId = null
        }
      }),

      setSelectedPlanFileId: id => set((state) => {
        state.selectedPlanFileId = id
      }),
    })),
    { name: 'plan-store' },
  ),
)

export function selectOrderedPlanFiles(state: PlanStoreState): PlanFile[] {
  return state.planFileIdsOrdered
    .map(id => state.planFilesById[id])
    .filter(Boolean)
}
