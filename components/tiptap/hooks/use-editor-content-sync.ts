import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { setEditorContentFromString } from '@/components/tiptap/core/paste-handlers'

interface UseEditorContentSyncOptions {
  editor: Editor | null
  content?: string
  resetKey?: string
}

export function useEditorContentSync({
  editor,
  content = '',
  resetKey,
}: UseEditorContentSyncOptions) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isContentUserEdited, setIsContentUserEdited] = useState(false)
  const lastContentRef = useRef('')
  const initTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (!editor) return

    if (!isInitialized) {
      if (!content) {
        editor.commands.clearContent()
        initTimeoutRef.current = setTimeout(() => setIsInitialized(true), 0)
        return
      }
      lastContentRef.current = setEditorContentFromString(editor, content)
      initTimeoutRef.current = setTimeout(() => setIsInitialized(true), 0)
    }
  }, [editor, content, isInitialized])

  useEffect(() => {
    if (!editor || !isInitialized) return

    const handleTransaction = (props: { transaction: { docChanged: boolean, steps: unknown[] } }) => {
      if (props.transaction.docChanged && props.transaction.steps.length > 0) {
        setIsContentUserEdited(true)
      }
    }

    editor.on('transaction', handleTransaction)
    return () => {
      editor.off('transaction', handleTransaction)
    }
  }, [editor, isInitialized])

  useEffect(() => {
    if (resetKey) {
      initTimeoutRef.current = setTimeout(() => {
        setIsInitialized(false)
        setIsContentUserEdited(false)
      }, 0)
      lastContentRef.current = ''
    }
  }, [resetKey])

  useEffect(() => {
    if (!editor || !isInitialized || isContentUserEdited) return

    const currentContent = lastContentRef.current
    if (content && currentContent && content !== currentContent) {
      const diffRatio = Math.abs(content.length - currentContent.length) / currentContent.length
      if (diffRatio > 0.1) {
        lastContentRef.current = setEditorContentFromString(editor, content)
      }
    }
  }, [content, isInitialized, isContentUserEdited, editor])

  useEffect(() => {
    return () => {
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current)
    }
  }, [])

  return { isInitialized, lastContentRef }
}
