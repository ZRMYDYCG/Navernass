'use client'

import type { ChapterItemProps } from './types'
import { useSortable } from '@dnd-kit/sortable'
import * as Popover from '@radix-ui/react-popover'
import { formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { ArrowRightLeft, Copy, Edit2, FileText, GripVertical, Trash2, Users } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useI18n, useLocale } from '@/hooks/use-i18n'
import { setChapterAttachmentDragData } from '@/lib/editor/chapter-attachment-drag'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import { HoverActionBar, HoverActionButton } from './hover-action-button'

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
  const { t } = useI18n()
  const { locale } = useLocale()
  const dateLocale = locale === 'zh-CN' ? zhCN : enUS
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTitle, setEditingTitle] = useState(chapter.title)
  const [isRenaming, setIsRenaming] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const chapterCharacterPreviewChapterId = useAppStore(state => state.characterGraph.chapterCharacterPreviewChapterId)
  const toggleChapterCharacterPreview = useAppStore(state => state.characterGraphActions.toggleChapterCharacterPreview)
  const isCharacterPreviewActive = chapterCharacterPreviewChapterId === chapter.id

  const updatedAtLabel = useMemo(() => {
    if (!chapter.updated_at) return ''
    try {
      return formatDistanceToNow(new Date(chapter.updated_at), {
        addSuffix: true,
        locale: dateLocale,
      })
    } catch {
      return ''
    }
  }, [chapter.updated_at, dateLocale])

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

  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: chapter.id,
  })

  // 不应用 transform/transition——让"刀切式"重排靠列表项位置变化呈现，
  // 而不是单个 item 的 CSS transform 平移（那会产生漂浮感）。
  const style = {
    opacity: isDragging ? 0 : 1,
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            'group/chapter relative my-0.5 flex min-h-[28px] items-center overflow-hidden rounded-lg border px-2 py-0.5 transition-all duration-200 ease-out',
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
                      : 'opacity-30 group-hover/chapter:opacity-70',
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
                      {t('editor.leftPanel.chapters.chapterItem.rename')}
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
                      {t('editor.leftPanel.chapters.chapterItem.delete')}
                    </button>
                  )}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <div
              className={cn(
                'flex-1 min-w-0 flex items-center gap-1.5',
                !isEditingTitle && 'cursor-grab active:cursor-grabbing',
              )}
              draggable={!isEditingTitle}
              onDragStart={(e) => {
                if (isEditingTitle) return
                setChapterAttachmentDragData(e.dataTransfer, {
                  id: chapter.id,
                  title: chapter.title,
                })
              }}
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

            {!isEditingTitle && updatedAtLabel && (
              <span
                className={cn(
                  'ml-1 shrink-0 text-[10px] tabular-nums whitespace-nowrap transition-opacity',
                  'text-muted-foreground/70',
                  // hover 时让位给操作按钮
                  'group-hover/chapter:opacity-0',
                )}
                title={chapter.updated_at}
              >
                {updatedAtLabel}
              </span>
            )}

            {!isEditingTitle && (
              <HoverActionBar group="chapter" expanded={isSelected || isCharacterPreviewActive}>
                <HoverActionButton
                  group="chapter"
                  label={t('editor.leftPanel.chapters.chapterItem.characterPreview')}
                  onClick={() => {
                    onSelect()
                    toggleChapterCharacterPreview(chapter.id)
                  }}
                  delayMs={0}
                  className={cn(isCharacterPreviewActive && 'bg-primary/15 text-primary')}
                >
                  <Users className="h-2.5 w-2.5" />
                </HoverActionButton>
                {onRename && (
                  <HoverActionButton
                    group="chapter"
                    label={t('editor.leftPanel.chapters.chapterItem.editTitle')}
                    onClick={openInlineTitleEditor}
                    delayMs={45}
                  >
                    <Edit2 className="h-2.5 w-2.5" />
                  </HoverActionButton>
                )}
                {onCopy && (
                  <HoverActionButton
                    group="chapter"
                    label={isCopying ? t('editor.leftPanel.chapters.chapterItem.creatingCopy') : t('editor.leftPanel.chapters.chapterItem.createCopy')}
                    onClick={async () => {
                      setIsCopying(true)
                      try {
                        await onCopy(chapter)
                      } finally {
                        setIsCopying(false)
                      }
                    }}
                    disabled={isCopying}
                    delayMs={90}
                  >
                    <Copy className="h-2.5 w-2.5" />
                  </HoverActionButton>
                )}
                {onMove && (
                  <HoverActionButton
                    group="chapter"
                    label={t('editor.leftPanel.chapters.chapterItem.moveToVolume')}
                    onClick={() => onMove(chapter)}
                    delayMs={135}
                  >
                    <ArrowRightLeft className="h-2.5 w-2.5" />
                  </HoverActionButton>
                )}
                {onDelete && (
                  <HoverActionButton
                    group="chapter"
                    label={t('editor.leftPanel.chapters.chapterItem.delete')}
                    onClick={() => onDelete(chapter)}
                    delayMs={180}
                    variant="destructive"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </HoverActionButton>
                )}
              </HoverActionBar>
            )}
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
            {t('editor.leftPanel.chapters.chapterItem.editTitle')}
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
            {isCopying ? t('editor.leftPanel.chapters.chapterItem.creatingCopy') : t('editor.leftPanel.chapters.chapterItem.createCopy')}
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
            {t('editor.leftPanel.chapters.chapterItem.moveToVolume')}
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
              {t('editor.leftPanel.chapters.chapterItem.delete')}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
