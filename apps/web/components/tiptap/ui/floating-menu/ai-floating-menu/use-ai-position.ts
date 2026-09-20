import type { Editor } from '@tiptap/react'
import { useEffect, useState } from 'react'

interface Position {
  top: number
  left: number
}

export function useAIPosition(editor: Editor | null, show: boolean): Position | null {
  const [position, setPosition] = useState<Position | null>(null)

  useEffect(() => {
    if (!editor || !show) {
      requestAnimationFrame(() => {
        setPosition(null)
      })
      return
    }

    const updatePosition = () => {
      const { from, to } = editor.state.selection
      if (from === to) {
        requestAnimationFrame(() => {
          setPosition(null)
        })
        return
      }

      const { view } = editor
      const { state } = view
      const { selection } = state

      try {
        const start = view.coordsAtPos(selection.from)
        const end = view.coordsAtPos(selection.to)

        const top = end.bottom + window.scrollY + 10
        const left = (start.left + end.right) / 2 + window.scrollX

        requestAnimationFrame(() => {
          setPosition({ top, left })
        })
      } catch (error) {
        console.warn('Failed to get selection coordinates:', error)
      }
    }

    updatePosition()

    const handleScroll = () => {
      updatePosition()
    }

    const handleSelectionUpdate = () => {
      updatePosition()
    }

    const handleUpdate = () => {
      updatePosition()
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('update', handleUpdate)

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      editor.off('update', handleUpdate)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [editor, show])

  return position
}
