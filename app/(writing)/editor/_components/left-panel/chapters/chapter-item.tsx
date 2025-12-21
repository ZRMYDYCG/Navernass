import type { ChapterItemProps } from './types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as Popover from '@radix-ui/react-popover'
import { ArrowRightLeft, Copy, Edit2, FileText, GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

export function ChapterItem({
  chapter,
  isSelected,
  onSelect,
  onRename,
  onDelete,
  onCopy,
  onMove,
}: ChapterItemProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [isCopying, setIsCopying] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={`group px-2 py-0.5 my-0.5 min-h-[28px] flex items-center rounded-lg transition-all duration-300 ease-out ${
            isSelected
              ? 'bg-background shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
              : 'hover:bg-background/60'
          }`}
        >
          <div className="flex items-center gap-1.5 w-full">
            <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  {...attributes}
                  {...listeners}
                  className={`flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5 hover:bg-accent rounded transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
                  }`}
                  onClick={e => e.stopPropagation()}
                >
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="bg-card rounded-lg shadow-lg border border-border p-1 z-50 min-w-[160px]"
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      删除
                    </button>
                  )}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <div className="flex-1 min-w-0 flex items-baseline justify-between gap-1.5" onClick={onSelect}>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <h3
                  className={`text-[12px] font-normal leading-snug truncate flex-1 transition-colors ${
                    isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {chapter.title}
                </h3>
              </div>

              <span
                className={`text-[10px] flex-shrink-0 transition-opacity ${
                  isSelected ? 'text-muted-foreground' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                }`}
              >
                {chapter.wordCount}
              </span>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {onRename && (
          <ContextMenuItem
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              onRename(chapter)
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
          >
            <Edit2 className="w-2.5 h-2.5" />
            编辑标题
          </ContextMenuItem>
        )}
        {onCopy && (
          <ContextMenuItem
            onClick={async (e: React.MouseEvent) => {
              e.stopPropagation()
              setIsCopying(true)
              try {
                await onCopy(chapter)
              } finally {
                setIsCopying(false)
              }
            }}
            disabled={isCopying}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
          >
            <Copy className="w-2.5 h-2.5" />
            {isCopying ? '创建副本中...' : '创建副本'}
          </ContextMenuItem>
        )}
        {onMove && (
          <ContextMenuItem
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              onMove(chapter)
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
          >
            <ArrowRightLeft className="w-2.5 h-2.5" />
            将章节移入
          </ContextMenuItem>
        )}
        {onDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onDelete(chapter)
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="w-2.5 h-2.5" />
              删除
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
