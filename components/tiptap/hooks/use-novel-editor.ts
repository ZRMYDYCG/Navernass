'use client'

import { useEditor } from '@tiptap/react'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { calculateEditorStats } from '@/components/tiptap/core/calculate-stats'
import { createNovelEditorExtensions, PROSE_MIRROR_CLASS } from '@/components/tiptap/core/create-novel-editor'
import { createPasteHandler } from '@/components/tiptap/core/paste-handlers'
import type { NovelEditorMode } from '@/components/tiptap/core/types'
import { useAutoSave } from '@/components/tiptap/hooks/use-auto-save'
import { useEditorContentSync } from '@/components/tiptap/hooks/use-editor-content-sync'

interface UseNovelEditorOptions {
  mode: NovelEditorMode
  content?: string
  placeholder?: string
  onUpdate?: (content: string) => void
  onStatsChange?: (stats: { words: number, characters: number }) => void
  autoSave?: boolean
  autoSaveDelay?: number
  editable?: boolean
  enableAi?: boolean
  resetKey?: string
}

export function useNovelEditor({
  mode,
  content = '',
  placeholder,
  onUpdate,
  onStatsChange,
  autoSave = true,
  autoSaveDelay = 3000,
  editable = true,
  enableAi = mode !== 'lite',
  resetKey,
}: UseNovelEditorOptions) {
  const { t } = useI18n()
  const placeholderText = placeholder ?? t('tiptap.editor.placeholder')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const uploadIllustration = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'illustration')
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || t('tiptap.editor.uploadIllustrationFailed'))
      }
      const result = await response.json()
      return result.data.url as string
    } finally {
      setIsUploadingImage(false)
    }
  }

  const extensions = useMemo(
    () => createNovelEditorExtensions({ mode, placeholder: placeholderText, t, enableAi }),
    [mode, placeholderText, t, enableAi],
  )

  const pasteHandler = useMemo(
    () => createPasteHandler(uploadIllustration),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t only affects error message
    [t],
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: '',
    editable,
    editorProps: {
      attributes: { class: PROSE_MIRROR_CLASS },
      handleDOMEvents: {
        blur: () => false,
        paste: pasteHandler,
      },
    },
  })

  const { lastContentRef } = useAutoSave({
    editor,
    onUpdate,
    onStatsChange,
    autoSave,
    autoSaveDelay,
  })

  const { isInitialized } = useEditorContentSync({
    editor,
    content,
    resetKey,
  })

  useEffect(() => {
    if (editor && onStatsChange) {
      onStatsChange(calculateEditorStats(editor.getText()))
    }
  }, [editor, onStatsChange, content])

  useEffect(() => {
    if (isInitialized && editor) {
      lastContentRef.current = editor.getHTML()
    }
  }, [isInitialized, editor, lastContentRef])

  return {
    editor,
    isInitialized,
    isUploadingImage,
  }
}
