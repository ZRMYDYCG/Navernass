import type { NovelCharacter } from '@/lib/supabase/sdk'
import type { Relationship } from '@/lib/supabase/sdk/types'

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function stripChapterHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export function findCharactersInChapter(
  content: string,
  characters: NovelCharacter[],
  chapterTitle?: string,
): NovelCharacter[] {
  const plain = stripChapterHtml(content || '')
  const found = new Set<string>()

  const sorted = [...characters].sort((a, b) => b.name.length - a.name.length)
  for (const character of sorted) {
    const name = character.name?.trim()
    if (!name) continue
    if (new RegExp(escapeRegex(name)).test(plain)) {
      found.add(character.id)
    }
  }

  if (chapterTitle) {
    for (const character of characters) {
      const appearance = character.first_appearance?.trim()
      if (!appearance) continue
      if (appearance === chapterTitle || chapterTitle.includes(appearance)) {
        found.add(character.id)
      }
    }
  }

  return characters.filter(character => found.has(character.id))
}

export function filterRelationshipsForCharacters(
  relationships: Relationship[],
  characterIds: Set<string>,
): Relationship[] {
  return relationships.filter(
    relationship =>
      characterIds.has(relationship.sourceId)
      && characterIds.has(relationship.targetId),
  )
}
