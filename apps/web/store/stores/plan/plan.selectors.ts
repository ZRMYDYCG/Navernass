import type { PlanFile } from '@/lib/supabase/sdk'
import type { PlanStore } from './plan.types'

export const selectPlan = (state: PlanStore) => state.plan
export const selectPlanCurrentNovelId = (state: PlanStore) => state.plan.currentNovelId
export const selectPlanHydrated = (state: PlanStore) => state.plan.hydrated
export const selectSelectedPlanFileId = (state: PlanStore) => state.plan.selectedPlanFileId
export const selectPlanFileById = (id: string) => (state: PlanStore): PlanFile | undefined =>
  state.plan.planFilesById[id]

/** 按 order_index 拿到 plan files 列表。返回新数组，订阅时需配 useShallow。 */
export function selectOrderedPlanFiles(state: PlanStore): PlanFile[] {
  return state.plan.planFileIdsOrdered
    .map(id => state.plan.planFilesById[id])
    .filter(Boolean)
}
