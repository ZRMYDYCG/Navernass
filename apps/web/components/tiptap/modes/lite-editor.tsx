'use client'

import { EditorShell } from '@/components/tiptap/core/editor-shell'
import type { LiteEditorProps } from '@/components/tiptap/core/types'
import { useNovelEditor } from '@/components/tiptap/hooks/use-novel-editor'
import '@/components/tiptap/styles/tiptap.css'

export function LiteEditor({
  content = '',
  placeholder,
  onUpdate,
  onStatsChange,
  autoSave = true,
  autoSaveDelay = 3000,
  className = '',
  editable = true,
}: LiteEditorProps) {
  const { editor, isInitialized, isUploadingImage } = useNovelEditor({
    mode: 'lite',
    content,
    placeholder,
    onUpdate,
    onStatsChange,
    autoSave,
    autoSaveDelay,
    editable,
    enableAi: false,
  })

  return (
    <EditorShell
      editor={editor}
      mode="lite"
      className={className}
      editable={editable}
      content={content}
      isInitialized={isInitialized}
      enableAi={false}
      isUploadingImage={isUploadingImage}
    />
  )
}
