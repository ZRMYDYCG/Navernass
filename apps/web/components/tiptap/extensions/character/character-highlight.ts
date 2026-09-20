import type { Node as ProseMirrorNode } from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'
import type { NovelCharacter } from '@/lib/supabase/sdk'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export interface CharacterHighlightOptions {
  characters: NovelCharacter[]
}

export const CharacterHighlight = Extension.create<CharacterHighlightOptions>({
  name: 'character-highlight',

  addOptions() {
    return {
      characters: [],
    }
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('character-highlight')

    return [
      new Plugin({
        key: pluginKey,

        state: {
          init() {
            return {
              characters: [] as NovelCharacter[],
              decorations: DecorationSet.empty,
            }
          },
          apply(tr, value) {
            const updateData = tr.getMeta('character-highlight-update')
            if (updateData) {
              const { characters } = updateData
              const decorations = createDecorations(tr.doc, characters)
              return {
                characters,
                decorations,
              }
            }

            if (tr.docChanged && value.characters.length > 0) {
              const decorations = createDecorations(tr.doc, value.characters)
              return {
                ...value,
                decorations,
              }
            }

            return value
          },
        },

        props: {
          decorations(state) {
            const pluginState = pluginKey.getState(state)
            return pluginState?.decorations || DecorationSet.empty
          },
        },
      }),
    ]
  },
})

function createDecorations(
  doc: ProseMirrorNode,
  characters: NovelCharacter[],
): DecorationSet {
  if (!characters || characters.length === 0) {
    return DecorationSet.empty
  }

  const decorations: Decoration[] = []

  const sortedCharacters = [...characters].sort((a, b) => b.name.length - a.name.length)

  const characterMap = new Map<string, NovelCharacter>()
  const names: string[] = []

  sortedCharacters.forEach((char) => {
    if (char.name && char.name.trim()) {
      characterMap.set(char.name, char)
      names.push(escapeRegex(char.name))
    }
  })

  if (names.length === 0) {
    return DecorationSet.empty
  }

  const regex = new RegExp(names.join('|'), 'g')

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (!node.isText) return

    const nodeText = node.textContent
    if (!nodeText) return

    regex.lastIndex = 0
    let matchResult = regex.exec(nodeText)

    while (matchResult !== null) {
      const name = matchResult[0]
      const character = characterMap.get(name)

      if (character) {
        const from = pos + matchResult.index
        const to = from + name.length

        decorations.push(
          Decoration.inline(from, to, {
            'nodeName': 'span',
            'class': 'character-highlight cursor-pointer border-b border-dotted border-primary/50 hover:bg-primary/10 transition-colors',
            'data-character-id': character.id,
          }),
        )
      }

      matchResult = regex.exec(nodeText)
    }
  })

  return DecorationSet.create(doc, decorations)
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function updateCharacterHighlight(
  view: EditorView,
  characters: NovelCharacter[],
) {
  const { state, dispatch } = view
  const tr = state.tr.setMeta('character-highlight-update', {
    characters,
  })
  dispatch(tr)
}
