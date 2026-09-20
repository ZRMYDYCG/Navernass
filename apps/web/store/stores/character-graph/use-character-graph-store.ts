import { createBoundStore } from '../../create-store'
import { createCharacterGraphActions } from './character-graph.actions'
import { characterGraphInitialState } from './character-graph.initial-state'
import type { CharacterGraphStore } from './character-graph.types'

export const useCharacterGraphStore = createBoundStore<CharacterGraphStore>('character-graph-store', (set, get) => ({
  characterGraph: characterGraphInitialState,
  characterGraphActions: createCharacterGraphActions(set, get),
}))
