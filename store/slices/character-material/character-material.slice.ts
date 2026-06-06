import type { StoreSlice } from '../../store.types'
import { createCharacterMaterialActions } from './character-material.actions'
import { characterMaterialInitialState } from './character-material.initial-state'
import type { CharacterMaterialSlice } from './character-material.types'

export const createCharacterMaterialSlice: StoreSlice<CharacterMaterialSlice> = (set, get) => ({
  characterMaterial: characterMaterialInitialState,
  characterMaterialActions: createCharacterMaterialActions(set, get),
})
