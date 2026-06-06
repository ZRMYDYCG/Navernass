import type { AppStore } from '../../store.types'
import type { NovelCharacter } from '@/lib/supabase/sdk'

export const selectCharacterMaterial = (state: AppStore) => state.characterMaterial
export const selectCharacters = (state: AppStore): NovelCharacter[] => state.characterMaterial.characters
export const selectMaterialSelectedCharacterId = (state: AppStore) => state.characterMaterial.selectedCharacterId
export const selectCharacterChapterMap = (state: AppStore) => state.characterMaterial.characterChapterMap
export function selectCharacterChapterIds(characterId: string) {
  return (state: AppStore): string[] => state.characterMaterial.characterChapterMap[characterId] ?? []
}
