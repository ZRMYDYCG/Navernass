import type { CharacterMaterialStore } from './character-material.types'
import type { NovelCharacter } from '@/lib/supabase/sdk'

export const selectCharacterMaterial = (state: CharacterMaterialStore) => state.characterMaterial
export const selectCharacters = (state: CharacterMaterialStore): NovelCharacter[] => state.characterMaterial.characters
export const selectMaterialSelectedCharacterId = (state: CharacterMaterialStore) => state.characterMaterial.selectedCharacterId
export const selectCharacterChapterMap = (state: CharacterMaterialStore) => state.characterMaterial.characterChapterMap
export function selectCharacterChapterIds(characterId: string) {
  return (state: CharacterMaterialStore): string[] => state.characterMaterial.characterChapterMap[characterId] ?? []
}
