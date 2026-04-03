import type { NovelCharacter } from '@/lib/supabase/sdk'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface CharacterMaterialStoreState {
  characters: NovelCharacter[]
  selectedCharacterId: string | null
  characterChapterMap: Record<string, string[]> // characterId -> chapterIds

  setCharacters: (characters: NovelCharacter[]) => void
  upsertCharacter: (character: NovelCharacter) => void
  removeCharacter: (id: string) => void
  selectCharacter: (id?: string | null) => void

  setCharacterChapterIds: (characterId: string, chapterIds: string[]) => void
  getCharacterChapterIds: (characterId: string) => string[]
}

export const useCharacterMaterialStore = create<CharacterMaterialStoreState>()(
  devtools(
    (set, get) => ({
      characters: [],
      selectedCharacterId: null,
      characterChapterMap: {},

      setCharacters: characters => set({ characters }),

      upsertCharacter: character => set((state) => {
        const index = state.characters.findIndex(item => item.id === character.id)
        if (index === -1) {
          return { characters: [...state.characters, character] }
        }
        const next = state.characters.slice()
        next[index] = character
        return { characters: next }
      }),

      removeCharacter: id => set(state => ({
        characters: state.characters.filter(item => item.id !== id),
        selectedCharacterId: state.selectedCharacterId === id ? null : state.selectedCharacterId,
      })),

      selectCharacter: id => set({ selectedCharacterId: id ? String(id) : null }),

      setCharacterChapterIds: (characterId, chapterIds) => set(state => ({
        characterChapterMap: { ...state.characterChapterMap, [characterId]: chapterIds },
      })),

      getCharacterChapterIds: characterId => get().characterChapterMap[characterId] ?? [],
    }),
    { name: 'characterMaterialStore' },
  ),
)
