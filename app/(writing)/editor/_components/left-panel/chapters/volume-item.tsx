'use client'

import type { Volume } from '../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as Popover from '@radix-ui/react-popover'
import { BookOpen, ChevronDown, ChevronRight, Edit2, GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface VolumeItemProps {
  volume: Volume
  isExpanded: boolean
  onToggle: () => void
  onRename?: (volume: Volume) => void
  onDelete?: (volume: Volume) => void
  onCreateChapter?: (volumeId: string) => void
  children?: React.ReactNode
}

export function VolumeItem({
  volume,
  isExpanded,
  onToggle,
  onRename,
  onDelete,
  onCreateChapter,
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
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div ref={setNodeRef} style={style} className="group mb-2">
          <div className="px-3 py-2 flex items-center rounded-lg transition-colors hover:bg-stone-200/30 dark:hover:bg-zinc-800/50 min-h-[40px]">
            <div className="flex items-center gap-2 w-full">
              {/* 拖拽手柄 + Popover */}
              <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className={`flex-shrink-0 cursor-grab active:cursor-grabbing p-1 hover:bg-stone-200/50 dark:hover:bg-zinc-700 rounded transition-opacity ${
                      isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                    }`}
                    onClick={e => e.stopPropagation()}
                  >
                    <GripVertical className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-stone-200 dark:border-zinc-700 p-1 z-50 min-w-[160px]"
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
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
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
                          onDelete(volume)
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

              {/* 展开/折叠按钮 */}
              <button
                type="button"
                onClick={onToggle}
                className="p-1 hover:bg-stone-200/50 dark:hover:bg-zinc-700 rounded transition-colors text-stone-500 dark:text-zinc-400"
              >
                {isExpanded
                  ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )
                  : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
              </button>

              {/* 卷信息 */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
                <h3 className="text-sm font-medium text-[#333333] dark:text-zinc-100 truncate leading-none">
                  {volume.title}
                </h3>
              </div>
            </div>
          </div>

          {/* 卷下的章节 */}
          {isExpanded && children && (
            <div className="ml-4 border-l border-stone-200/50 dark:border-zinc-800 pl-2 mt-1 space-y-1">
              {children}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {onCreateChapter && (
          <ContextMenuItem
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              onCreateChapter(volume.id)
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
          >
            <BookOpen className="w-2.5 h-2.5" />
            新增章节
          </ContextMenuItem>
        )}
        {onRename && (
          <ContextMenuItem
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              onRename(volume)
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
          >
            <Edit2 className="w-2.5 h-2.5" />
            编辑卷名
          </ContextMenuItem>
        )}
        {onDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onDelete(volume)
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
            >
              <Trash2 className="w-2.5 h-2.5" />
              删除卷
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
