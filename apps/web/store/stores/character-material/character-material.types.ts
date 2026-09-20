import type { NovelCharacter } from '@/lib/supabase/sdk'

export type CharacterMaterialState = {
  characters: NovelCharacter[]
  selectedCharacterId: string | null
  /** characterId -> chapterIds 出现过的章节 */
  characterChapterMap: Record<string, string[]>
}

export type CharacterMaterialActions = {
  setCharacters: (characters: NovelCharacter[]) => void
  upsertCharacter: (character: NovelCharacter) => void
  removeCharacter: (id: string) => void
  selectCharacter: (id?: string | null) => void
  setCharacterChapterIds: (characterId: string, chapterIds: string[]) => void
}

export type CharacterMaterialStore = {
  characterMaterial: CharacterMaterialState
  characterMaterialActions: CharacterMaterialActions
}
