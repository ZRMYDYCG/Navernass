'use client'

import { useEffect } from 'react'
import { EditorShell } from '@/components/tiptap/core/editor-shell'
import type { PlanEditorProps } from '@/components/tiptap/core/types'
import { useNovelEditor } from '@/components/tiptap/hooks/use-novel-editor'
import { DialogProvider, setGlobalDialog, useDialog } from '@/components/tiptap/ui/dialog-manager'
import 'tippy.js/dist/tippy.css'
import '@/components/tiptap/styles/tiptap.css'

function PlanEditorInner({
  content = '',
  placeholder,
  onUpdate,
  onStatsChange,
  autoSave = true,
  autoSaveDelay = 3000,
  className = '',
  editable = true,
  planFileId,
  enableAi = true,
}: PlanEditorProps) {
  const { showInputDialog, showImageGenerationDialog } = useDialog()

  useEffect(() => {
    setGlobalDialog(showInputDialog, showImageGenerationDialog)
  }, [showInputDialog, showImageGenerationDialog])

  const { editor, isInitialized, isUploadingImage } = useNovelEditor({
    mode: 'plan',
    content,
    placeholder,
    onUpdate,
    onStatsChange,
    autoSave,
    autoSaveDelay,
    editable,
    enableAi,
    resetKey: planFileId,
  })

  return (
    <EditorShell
      editor={editor}
      mode="plan"
      className={className}
      editable={editable}
      content={content}
      isInitialized={isInitialized}
      enableAi={enableAi}
      isUploadingImage={isUploadingImage}
    />
  )
}

export function PlanEditor(props: PlanEditorProps) {
  return (
    <DialogProvider>
      <PlanEditorInner {...props} />
    </DialogProvider>
  )
}
