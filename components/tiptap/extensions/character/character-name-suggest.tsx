import type { EditorState } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import type { NovelCharacter } from '@/lib/supabase/sdk'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface CharacterNameSuggestOptions {
  maxItems: number
  minQueryLength: number
}

interface CharacterNameSuggestState {
  characters: NovelCharacter[]
  ui: CharacterNameSuggestUIState | null
}

export interface CharacterNameSuggestUIState {
  query: string
  items: NovelCharacter[]
  range: { from: number, to: number }
  anchor: { x: number, y: number }
  selectedIndex: number
}

export const characterNameSuggestPluginKey = new PluginKey<CharacterNameSuggestState>('character-name-suggest')

export const CharacterNameSuggest = Extension.create<CharacterNameSuggestOptions>({
  name: 'character-name-suggest',

  addOptions() {
    return {
      maxItems: 6,
      minQueryLength: 1,
    }
  },

  addProseMirrorPlugins() {
    const editor = this.editor
    const { maxItems, minQueryLength } = this.options

    return [
      new Plugin<CharacterNameSuggestState>({
        key: characterNameSuggestPluginKey,
        state: {
          init() {
            return {
              characters: [],
              ui: null,
            }
          },
          apply(tr, value) {
            const updateData = tr.getMeta('character-name-suggest-update') as { characters: NovelCharacter[] } | undefined
            if (updateData) {
              return { ...value, characters: updateData.characters }
            }

            const uiData = tr.getMeta('character-name-suggest-ui') as CharacterNameSuggestUIState | null | undefined
            if (uiData !== undefined) {
              return { ...value, ui: uiData }
            }

            const selectedIndex = tr.getMeta('character-name-suggest-select') as number | undefined
            if (typeof selectedIndex === 'number' && value.ui) {
              return { ...value, ui: { ...value.ui, selectedIndex } }
            }

            return value
          },
        },
        view(view) {
          const update = () => {
            if (!view.hasFocus()) {
              const currentState = view.state
              const currentPluginState = characterNameSuggestPluginKey.getState(currentState)
              if (currentPluginState?.ui) {
                view.dispatch(currentState.tr.setMeta('character-name-suggest-ui', null))
              }
              return
            }

            const { state } = view
            const { selection } = state
            if (!selection.empty) {
              const pluginState = characterNameSuggestPluginKey.getState(state)
              if (pluginState?.ui) {
                view.dispatch(state.tr.setMeta('character-name-suggest-ui', null))
              }
              return
            }

            const { $from } = selection
            if (!$from.parent.isTextblock) {
              const pluginState = characterNameSuggestPluginKey.getState(state)
              if (pluginState?.ui) {
                view.dispatch(state.tr.setMeta('character-name-suggest-ui', null))
              }
              return
            }

            if ($from.parent.type.name === 'codeBlock') {
              const pluginState = characterNameSuggestPluginKey.getState(state)
              if (pluginState?.ui) {
                view.dispatch(state.tr.setMeta('character-name-suggest-ui', null))
              }
              return
            }

            const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\0', '\0')
            const match = textBefore.match(/([\u4E00-\u9FFFA-Z0-9]+)$/i)
            const query = match?.[1] || ''
            if (query.length < minQueryLength) {
              const pluginState = characterNameSuggestPluginKey.getState(state)
              if (pluginState?.ui) {
                view.dispatch(state.tr.setMeta('character-name-suggest-ui', null))
              }
              return
            }

            const pluginState = characterNameSuggestPluginKey.getState(state)
            const characters = pluginState?.characters || []
            if (characters.length === 0) {
              if (pluginState?.ui) {
                view.dispatch(state.tr.setMeta('character-name-suggest-ui', null))
              }
              return
            }

            const items = characters
              .filter(c => c.name && c.name.startsWith(query) && c.name !== query)
              .slice(0, maxItems)

            if (items.length === 0) {
              if (pluginState?.ui) {
                view.dispatch(state.tr.setMeta('character-name-suggest-ui', null))
              }
              return
            }

            const to = selection.from
            const from = to - query.length
            const docText = state.doc.textBetween(from, to, '\0', '\0')
            if (docText !== query) {
              if (pluginState?.ui) {
                view.dispatch(state.tr.setMeta('character-name-suggest-ui', null))
              }
              return
            }

            const coords = view.coordsAtPos(to)
            const nextUi: CharacterNameSuggestUIState = {
              query,
              items,
              range: { from, to },
              anchor: { x: coords.left, y: coords.bottom },
              selectedIndex: pluginState?.ui?.selectedIndex ?? 0,
            }

            if (nextUi.selectedIndex >= nextUi.items.length) {
              nextUi.selectedIndex = 0
            }

            const currentUi = pluginState?.ui
            const currentIds = currentUi?.items.map(i => i.id).join('|') || ''
            const nextIds = nextUi.items.map(i => i.id).join('|')
            const sameUi = !!currentUi
              && currentUi.query === nextUi.query
              && currentUi.range.from === nextUi.range.from
              && currentUi.range.to === nextUi.range.to
              && currentUi.anchor.x === nextUi.anchor.x
              && currentUi.anchor.y === nextUi.anchor.y
              && currentUi.selectedIndex === nextUi.selectedIndex
              && currentIds === nextIds

            if (!sameUi) {
              view.dispatch(state.tr.setMeta('character-name-suggest-ui', nextUi))
            }
          }

          update()

          return {
            update() {
              update()
            },
            destroy() {
              const currentState = view.state
              const pluginState = characterNameSuggestPluginKey.getState(currentState)
              if (pluginState?.ui) {
                view.dispatch(currentState.tr.setMeta('character-name-suggest-ui', null))
              }
            },
          }
        },
        props: {
          handleKeyDown(view, event) {
            const pluginState = characterNameSuggestPluginKey.getState(view.state)
            const ui = pluginState?.ui
            if (!ui) return false

            if (event.key === 'Escape') {
              event.preventDefault()
              view.dispatch(view.state.tr.setMeta('character-name-suggest-ui', null))
              return true
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault()
              const nextIndex = (ui.selectedIndex + ui.items.length - 1) % ui.items.length
              view.dispatch(view.state.tr.setMeta('character-name-suggest-select', nextIndex))
              return true
            }

            if (event.key === 'ArrowDown') {
              event.preventDefault()
              const nextIndex = (ui.selectedIndex + 1) % ui.items.length
              view.dispatch(view.state.tr.setMeta('character-name-suggest-select', nextIndex))
              return true
            }

            if (event.key === 'Enter' || event.key === 'Tab') {
              const item = ui.items[ui.selectedIndex]
              if (!item) return false
              event.preventDefault()

              const currentText = view.state.doc.textBetween(ui.range.from, ui.range.to, '\0', '\0')
              if (currentText !== ui.query) {
                view.dispatch(view.state.tr.setMeta('character-name-suggest-ui', null))
                return true
              }

              editor
                .chain()
                .focus()
                .insertContentAt(ui.range, item.name)
                .run()

              view.dispatch(view.state.tr.setMeta('character-name-suggest-ui', null))
              return true
            }

            return false
          },
        },
      }),
    ]
  },
})

export function updateCharacterNameSuggest(
  view: EditorView,
  characters: NovelCharacter[],
) {
  const { state, dispatch } = view
  dispatch(state.tr.setMeta('character-name-suggest-update', { characters }))
}

export function getCharacterNameSuggestUIState(state: EditorState): CharacterNameSuggestUIState | null {
  const pluginState = characterNameSuggestPluginKey.getState(state)
  return pluginState?.ui ?? null
}
