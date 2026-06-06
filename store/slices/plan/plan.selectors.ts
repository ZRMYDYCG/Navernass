import type { PlanFile } from '@/lib/supabase/sdk'
import type { AppStore } from '../../store.types'

export const selectPlan = (state: AppStore) => state.plan
export const selectPlanCurrentNovelId = (state: AppStore) => state.plan.currentNovelId
export const selectPlanHydrated = (state: AppStore) => state.plan.hydrated
export const selectSelectedPlanFileId = (state: AppStore) => state.plan.selectedPlanFileId
export const selectPlanFileById = (id: string) => (state: AppStore): PlanFile | undefined =>
  state.plan.planFilesById[id]

/** 按 order_index 拿到 plan files 列表。返回新数组，订阅时需配 useShallow。 */
export function selectOrderedPlanFiles(state: AppStore): PlanFile[] {
  return state.plan.planFileIdsOrdered
    .map(id => state.plan.planFilesById[id])
    .filter(Boolean)
}
