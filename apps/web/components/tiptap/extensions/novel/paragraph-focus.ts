import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorState } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const PARAGRAPH_FOCUS_CLASS = 'has-paragraph-focus'

const paragraphFocusPluginKey = new PluginKey('paragraph-focus')

function getActiveTextblockRange(state: EditorState) {
  const { $from } = state.selection

  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).isTextblock) {
      return {
        from: $from.before(depth),
        to: $from.after(depth),
      }
    }
  }

  return null
}

function buildParagraphFocusDecorations(state: EditorState) {
  const range = getActiveTextblockRange(state)
  if (!range) return DecorationSet.empty

  return DecorationSet.create(state.doc, [
    Decoration.node(range.from, range.to, { class: PARAGRAPH_FOCUS_CLASS }),
  ])
}

/** 光标所在段落高亮，配合 [data-prose-focus] 卷面 CSS 使用 */
export const ParagraphFocus = Extension.create({
  name: 'paragraphFocus',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: paragraphFocusPluginKey,
        props: {
          decorations(state) {
            return buildParagraphFocusDecorations(state)
          },
        },
      }),
    ]
  },
})
