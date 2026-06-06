import type { StoreSlice } from '../../store.types'
import { createWorldviewActions } from './worldview.actions'
import { worldviewInitialState } from './worldview.initial-state'
import type { WorldviewSlice } from './worldview.types'

export const createWorldviewSlice: StoreSlice<WorldviewSlice> = (set, get) => ({
  worldview: worldviewInitialState,
  worldviewActions: createWorldviewActions(set, get),
})
