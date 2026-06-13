import type { Editor } from '@tiptap/react'
import { useEffect, useRef } from 'react'
import { calculateEditorStats } from '@/components/tiptap/core/calculate-stats'

interface UseAutoSaveOptions {
  editor: Editor | null
  onUpdate?: (content: string) => void
  onStatsChange?: (stats: { words: number, characters: number }) => void
  autoSave?: boolean
  autoSaveDelay?: number
}

export function useAutoSave({
  editor,
  onUpdate,
  onStatsChange,
  autoSave = true,
  autoSaveDelay = 3000,
}: UseAutoSaveOptions) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastContentRef = useRef('')

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      if (onStatsChange) {
        onStatsChange(calculateEditorStats(editor.getText()))
      }
      if (!onUpdate) return

      const persist = () => {
        const currentContent = editor.getHTML()
        if (currentContent !== lastContentRef.current) {
          lastContentRef.current = currentContent
          onUpdate(currentContent)
        }
      }

      if (autoSave) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(persist, autoSaveDelay)
      } else {
        persist()
      }
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [editor, onUpdate, onStatsChange, autoSave, autoSaveDelay])

  return { lastContentRef }
}
