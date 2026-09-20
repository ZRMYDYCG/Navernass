import type { Editor } from '@tiptap/react'
import { Slice } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'
import { parseMarkdownContent } from '@/components/tiptap/extensions/novel/markdown-parser'

export function createPasteHandler(uploadIllustration: (file: File) => Promise<string>) {
  return (view: EditorView, event: Event) => {
    const e = event as ClipboardEvent
    const items = e.clipboardData?.items
    if (!items) return false

    let pastedText: string | null = null
    const imageFiles: File[] = []

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]
      if (item.type === 'text/html' || item.type === 'text/plain') {
        pastedText = e.clipboardData!.getData(item.type)
        break
      }
      if (item.type?.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }

    if (pastedText && !/<[a-z][\s\S]*>/i.test(pastedText)) {
      e.preventDefault()
      const { state, dispatch } = view
      const doc = parseMarkdownContent(pastedText, state.schema)
      if (doc.content.childCount === 0) return false

      const { from, to } = state.selection
      const $from = state.doc.resolve(from)
      const openStart = $from.depth > 0 ? 1 : 0
      const openEnd = to !== from && state.doc.resolve(to).depth > 0 ? 1 : 0
      const slice = new Slice(doc.content, openStart, openEnd)
      dispatch(state.tr.replace(from, to, slice))
      return true
    }

    if (imageFiles.length > 0) {
      e.preventDefault()
      const file = imageFiles[0]
      void (async () => {
        try {
          const url = await uploadIllustration(file)
          const { state, dispatch } = view
          const imageNode = state.schema.nodes.image?.create({ src: url })
          if (!imageNode) return
          dispatch(state.tr.replaceSelectionWith(imageNode).scrollIntoView())
        } catch (error) {
          console.error('Failed to upload pasted image', error)
        }
      })()
      return true
    }

    return false
  }
}

export function setEditorContentFromString(editor: Editor, content: string) {
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content)
  if (isHtml) {
    editor.commands.setContent(content)
    return editor.getHTML()
  }
  const doc = parseMarkdownContent(content, editor.schema)
  editor.commands.setContent(doc.toJSON())
  return editor.getHTML()
}
