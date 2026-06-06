import { removeItemById, replaceArrayContents } from '../../utils'
import type { StoreGet, StoreSet } from '../../store.types'
import type { CharacterMaterialActions } from './character-material.types'

export function createCharacterMaterialActions(set: StoreSet, _get: StoreGet): CharacterMaterialActions {
  return {
    setCharacters: (characters) => {
      set((state) => {
        replaceArrayContents(state.characterMaterial.characters, characters)
      }, false, 'characterMaterial/setCharacters')
    },

    upsertCharacter: (character) => {
      set((state) => {
        const index = state.characterMaterial.characters.findIndex(item => item.id === character.id)
        if (index === -1) {
          state.characterMaterial.characters.push(character)
          return
        }
        state.characterMaterial.characters[index] = character
      }, false, 'characterMaterial/upsertCharacter')
    },

    removeCharacter: (id) => {
      set((state) => {
        removeItemById(state.characterMaterial.characters, id)
        if (state.characterMaterial.selectedCharacterId === id) {
          state.characterMaterial.selectedCharacterId = null
        }
      }, false, 'characterMaterial/removeCharacter')
    },

    selectCharacter: (id) => {
      set((state) => {
        state.characterMaterial.selectedCharacterId = id ? String(id) : null
      }, false, 'characterMaterial/selectCharacter')
    },

    setCharacterChapterIds: (characterId, chapterIds) => {
      set((state) => {
        state.characterMaterial.characterChapterMap[characterId] = chapterIds
      }, false, 'characterMaterial/setCharacterChapterIds')
    },
  }
}
