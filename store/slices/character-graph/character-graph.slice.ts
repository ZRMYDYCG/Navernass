import type { StoreSlice } from '../../store.types'
import { createCharacterGraphActions } from './character-graph.actions'
import { characterGraphInitialState } from './character-graph.initial-state'
import type { CharacterGraphSlice } from './character-graph.types'

export const createCharacterGraphSlice: StoreSlice<CharacterGraphSlice> = (set, get) => ({
  characterGraph: characterGraphInitialState,
  characterGraphActions: createCharacterGraphActions(set, get),
})
