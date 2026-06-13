import type { PlanState } from './plan.types'

export const planInitialState: PlanState = {
  currentNovelId: null,
  planFilesById: {},
  planFileIdsOrdered: [],
  hydrated: false,
  selectedPlanFileId: null,
}
