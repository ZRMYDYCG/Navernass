'use client'

import type { Volume } from '../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as Popover from '@radix-ui/react-popover'
import { ChevronDown, ChevronRight, Edit2, Folder, GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface VolumeItemProps {
  volume: Volume
  isExpanded: boolean
  onToggle: () => void
  onRename?: (volume: Volume) => void
  onDelete?: (volume: Volume) => void
  children?: React.ReactNode
}

export function VolumeItem({
  volume,
  isExpanded,
  onToggle,
  onRename,
  onDelete,
  children,
}: VolumeItemProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: volume.id,
    data: {
      type: 'volume',
      volume,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-2">
          {/* 拖拽手柄 + Popover */}
          <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
                      onRename(volume)
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
                      onDelete(volume)
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

          {/* 展开/折叠按钮 */}
          <button
            type="button"
            onClick={onToggle}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {isExpanded
              ? (
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )
              : (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
          </button>

          {/* 卷信息 */}
          <div className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer" onClick={onToggle}>
            <Folder className="w-4 h-4 flex-shrink-0 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {volume.title}
            </h3>
          </div>
        </div>
      </div>

      {/* 卷下的章节 */}
      {isExpanded && children && (
        <div className="ml-4 border-l border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  )
}
