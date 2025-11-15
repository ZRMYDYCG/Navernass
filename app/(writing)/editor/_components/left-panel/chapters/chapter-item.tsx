import type { ChapterItemProps } from './types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as Popover from '@radix-ui/react-popover'
import { Edit2, GripVertical, Trash2 } from 'lucide-react'
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
      className={`group px-1.5 py-1 cursor-pointer transition-colors ${
        isSelected ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center gap-1">
        {/* 拖拽手柄 + Popover */}
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              {...attributes}
              {...listeners}
              className={`cursor-grab active:cursor-grabbing p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <GripVertical className="w-3 h-3 text-gray-400" />
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
                  <Edit2 className="w-3.5 h-3.5" />
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
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* 章节信息 */}
        <div className="flex-1 min-w-0 flex items-center justify-between" onClick={onSelect}>
          <h3
            className={`text-xs font-normal truncate flex-1 ${
              isSelected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {chapter.title}
          </h3>

          <span
            className={`text-[10px] ml-1.5 ${
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
