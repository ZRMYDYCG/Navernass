'use client'

import { useEffect } from 'react'
import { EditorBridgeProvider } from '@/components/tiptap/core/editor-context'
import { EditorShell } from '@/components/tiptap/core/editor-shell'
import type { ChapterEditorProps } from '@/components/tiptap/core/types'
import { useNovelEditor } from '@/components/tiptap/hooks/use-novel-editor'
import { DialogProvider, setGlobalDialog, useDialog } from '@/components/tiptap/ui/dialog-manager'
import 'tippy.js/dist/tippy.css'
import '@/components/tiptap/styles/tiptap.css'

function ChapterEditorInner({
  content = '',
  placeholder,
  onUpdate,
  onStatsChange,
  autoSave = true,
  autoSaveDelay = 3000,
  className = '',
  editable = true,
  chapterId,
  characters = [],
  enableAi = true,
}: ChapterEditorProps) {
  const { showInputDialog, showImageGenerationDialog } = useDialog()

  useEffect(() => {
    setGlobalDialog(showInputDialog, showImageGenerationDialog)
  }, [showInputDialog, showImageGenerationDialog])

  const { editor, isInitialized, isUploadingImage } = useNovelEditor({
    mode: 'chapter',
    content,
    placeholder,
    onUpdate,
    onStatsChange,
    autoSave,
    autoSaveDelay,
    editable,
    enableAi,
    resetKey: chapterId,
  })

  return (
    <EditorShell
      editor={editor}
      mode="chapter"
      className={className}
      editable={editable}
      chapterId={chapterId}
      content={content}
      characters={characters}
      isInitialized={isInitialized}
      enableAi={enableAi}
      isUploadingImage={isUploadingImage}
    />
  )
}

export function ChapterEditor(props: ChapterEditorProps) {
  return (
    <EditorBridgeProvider chapterId={props.chapterId}>
      <DialogProvider>
        <ChapterEditorInner {...props} />
      </DialogProvider>
    </EditorBridgeProvider>
  )
}

/** @deprecated 使用 ChapterEditor */
export const TiptapEditor = ChapterEditor
