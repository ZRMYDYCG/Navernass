import { mergeAttributes, Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sceneBreak: {
      setSceneBreak: () => ReturnType
    }
  }
}

export const SceneBreak = Node.create({
  name: 'sceneBreak',
  group: 'block',
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: 'div[data-scene-break]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-scene-break': '',
        class: 'scene-break',
      }),
      ['span', { class: 'scene-break-mark', 'aria-hidden': 'true' }, '* * *'],
    ]
  },

  addCommands() {
    return {
      setSceneBreak: () => ({ commands }) => commands.insertContent({ type: this.name }),
    }
  },
})
