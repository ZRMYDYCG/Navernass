import type { StoreSlice } from '../../store.types'
import { createPlanActions } from './plan.actions'
import { planInitialState } from './plan.initial-state'
import type { PlanSlice } from './plan.types'

export const createPlanSlice: StoreSlice<PlanSlice> = (set, get) => ({
  plan: planInitialState,
  planActions: createPlanActions(set, get),
})
