import type { ChapterItemProps } from './types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as Popover from '@radix-ui/react-popover'
import { ArrowRightLeft, Copy, Edit2, FileText, GripVertical, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'

export function ChapterItem({
  chapter,
  isSelected,
  onSelect,
  onRename,
  onRenameInline,
  onDelete,
  onCopy,
  onMove,
}: ChapterItemProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTitle, setEditingTitle] = useState(chapter.title)
  const [isRenaming, setIsRenaming] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEditingTitle) {
      setEditingTitle(chapter.title)
    }
  }, [chapter.title, isEditingTitle])

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }
  }, [isEditingTitle])

  const openInlineTitleEditor = () => {
    setEditingTitle(chapter.title)
    setIsEditingTitle(true)
  }

  const cancelInlineTitleEditor = () => {
    setEditingTitle(chapter.title)
    setIsEditingTitle(false)
  }

  const saveInlineTitle = async () => {
    const nextTitle = editingTitle.trim()
    if (!nextTitle) {
      cancelInlineTitleEditor()
      return
    }
    if (nextTitle === chapter.title) {
      setIsEditingTitle(false)
      return
    }
    if (!onRenameInline) {
      onRename?.(chapter)
      setIsEditingTitle(false)
      return
    }

    try {
      setIsRenaming(true)
      await onRenameInline(chapter.id, nextTitle)
      setIsEditingTitle(false)
    } finally {
      setIsRenaming(false)
    }
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform) || undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            'group relative my-0.5 flex min-h-[28px] items-center rounded-lg border px-2 py-0.5 transition-all duration-200 ease-out',
            isSelected
              ? 'border-border bg-background/95 shadow-paper-sm'
              : 'border-transparent hover:border-border/50 hover:bg-background/60',
          )}
        >
          <div className="flex items-center gap-1.5 w-full">
            <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  {...attributes}
                  {...listeners}
                  className={cn(
                    'flex-shrink-0 cursor-grab rounded p-0.5 transition-all active:cursor-grabbing hover:bg-accent',
                    isSelected
                      ? 'opacity-100 text-primary/80'
                      : 'opacity-0 group-hover:opacity-30',
                  )}
                  onClick={e => e.stopPropagation()}
                >
                  <GripVertical className={cn('h-3.5 w-3.5', isSelected ? 'text-primary/80' : 'text-muted-foreground')} />
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
                        openInlineTitleEditor()
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

            <div
              className="flex-1 min-w-0 flex items-center gap-1.5"
              onClick={isEditingTitle ? undefined : onSelect}
            >
              <FileText className={cn('h-3.5 w-3.5 flex-shrink-0 transition-colors', isSelected ? 'text-primary/85' : 'text-muted-foreground')} />
              {isEditingTitle
                ? (
                    <input
                      ref={titleInputRef}
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      onBlur={() => {
                        if (!isRenaming) {
                          void saveInlineTitle()
                        }
                      }}
                      onClick={e => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          void saveInlineTitle()
                        } else if (e.key === 'Escape') {
                          e.preventDefault()
                          cancelInlineTitleEditor()
                        }
                      }}
                      disabled={isRenaming}
                      className="h-6 flex-1 min-w-0 rounded border border-border bg-background px-1.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  )
                : (
                    <h3
                      className={cn(
                        'flex-1 truncate text-[12px] font-normal transition-colors',
                        isSelected ? 'font-medium text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {chapter.title}
                    </h3>
                  )}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {onRename && (
          <ContextMenuItem
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              openInlineTitleEditor()
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
