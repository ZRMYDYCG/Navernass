'use client'

import type { Editor } from '@tiptap/react'
import { DragHandle as TiptapDragHandle } from '@tiptap/extension-drag-handle-react'
import { GripVertical } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

interface DragHandleProps {
  editor: Editor
}

export function DragHandle({ editor }: DragHandleProps) {
  const { t } = useI18n()

  return (
    <TiptapDragHandle editor={editor}>
      <div
        className="flex items-center justify-center w-6 h-6 mt-1 mr-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-all cursor-grab active:cursor-grabbing"
        title={t('tiptap.dragHandle.moveParagraph')}
      >
        <GripVertical className="w-4 h-4" />
      </div>
    </TiptapDragHandle>
  )
}
