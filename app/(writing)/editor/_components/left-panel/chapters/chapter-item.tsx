import type { ChapterItemProps } from './types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as Popover from '@radix-ui/react-popover'
import { Edit2, FileText, GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function ChapterItem({
  chapter,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: ChapterItemProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group px-4 py-3 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <div className="flex items-center gap-2">
        {/* 拖拽手柄 + Popover */}
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              {...attributes}
              {...listeners}
              className={`cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
              sideOffset={5}
              align="start"
            >
              {onRename && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRename(chapter)
                    setPopoverOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  重命名
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(chapter)
                    setPopoverOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* 章节信息 */}
        <div className="flex-1 min-w-0 flex items-center justify-between" onClick={onSelect}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
            <h3
              className={`text-sm font-medium truncate ${
                isSelected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {chapter.title}
            </h3>
          </div>

          <span
            className={`text-xs ${
              isSelected ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'
            }`}
          >
            {chapter.wordCount}
          </span>
        </div>
      </div>
    </div>
  )
}
