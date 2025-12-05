import CharacterCount from '@tiptap/extension-character-count'
import { TextAlign } from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export function useTiptapEditor(content?: string) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CharacterCount,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-gray max-w-none focus:outline-none min-h-full',
      },
      handleDOMEvents: {
        blur: () => {
          return false
        },
      },
    },
  })

  return editor
}
