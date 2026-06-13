import { createBoundStore } from '../../create-store'
import { createCharacterMaterialActions } from './character-material.actions'
import { characterMaterialInitialState } from './character-material.initial-state'
import type { CharacterMaterialStore } from './character-material.types'

export const useCharacterMaterialStore = createBoundStore<CharacterMaterialStore>('character-material-store', (set, get) => ({
  characterMaterial: characterMaterialInitialState,
  characterMaterialActions: createCharacterMaterialActions(set, get),
}))
