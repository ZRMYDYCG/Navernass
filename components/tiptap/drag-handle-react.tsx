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
        className="flex items-center justify-center w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all cursor-grab active:cursor-grabbing"
        title="拖拽移动段落"
      >
        <GripVertical className="w-4 h-4" />
      </div>
    </TiptapDragHandle>
  )
}
