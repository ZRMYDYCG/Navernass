import { createBoundStore } from '../../create-store'
import { createWorldviewActions } from './worldview.actions'
import { worldviewInitialState } from './worldview.initial-state'
import type { WorldviewStore } from './worldview.types'

export const useWorldviewStore = createBoundStore<WorldviewStore>('worldview-store', (set, get) => ({
  worldview: worldviewInitialState,
  worldviewActions: createWorldviewActions(set, get),
}))
