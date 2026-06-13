import { createBoundStore } from '../../create-store'
import { createPlanActions } from './plan.actions'
import { planInitialState } from './plan.initial-state'
import type { PlanStore } from './plan.types'

export const usePlanStore = createBoundStore<PlanStore>('plan-store', (set, get) => ({
  plan: planInitialState,
  planActions: createPlanActions(set, get),
}))
