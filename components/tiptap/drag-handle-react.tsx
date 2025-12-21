import type { Editor } from '@tiptap/react'
import { DragHandle as TiptapDragHandle } from '@tiptap/extension-drag-handle-react'
import { GripVertical } from 'lucide-react'

interface DragHandleProps {
  editor: Editor
}

export function DragHandle({ editor }: DragHandleProps) {
  return (
    <TiptapDragHandle editor={editor}>
      <div
        className="flex items-center justify-center w-6 h-6 mt-1 mr-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-all cursor-grab active:cursor-grabbing"
        title="拖拽移动段落"
      >
        <GripVertical className="w-4 h-4" />
      </div>
    </TiptapDragHandle>
  )
}
