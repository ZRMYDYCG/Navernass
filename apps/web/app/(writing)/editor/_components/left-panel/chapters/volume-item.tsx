'use client'

import type { Volume } from '../types'
import { useSortable } from '@dnd-kit/sortable'
import * as Popover from '@radix-ui/react-popover'
import { BookOpen, ChevronDown, Edit2, GripVertical, Trash2 } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useI18n } from '@/hooks/use-i18n'
import { setVolumeAttachmentDragData } from '@/lib/editor/chapter-attachment-drag'
import { cn } from '@/lib/utils'
import { HoverActionBar, HoverActionButton } from './hover-action-button'

interface VolumeItemProps {
  volume: Volume
  isExpanded: boolean
  /** 该卷下的章节数（用于在卷标题右侧显示统计） */
  chapterCount?: number
  onToggle: () => void
  onRename?: (volume: Volume) => void
  onDelete?: (volume: Volume) => void
  onCreateChapter?: (volumeId: string) => void
  children?: ReactNode
}

export function VolumeItem({
  volume,
  isExpanded,
  chapterCount,
  onToggle,
  onRename,
  onDelete,
  onCreateChapter,
  children,
}: VolumeItemProps) {
  const { t } = useI18n()
  const [popoverOpen, setPopoverOpen] = useState(false)

  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: volume.id,
    data: {
      type: 'volume',
      volume,
    },
  })

  // 不应用 transform/transition；列表的"让位"靠 ChapterList 在 onDragOver 中
  // 实时 arrayMove localVolumes 来呈现，而不是单个 item 平移。
  const style = {
    opacity: isDragging ? 0 : 1,
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div ref={setNodeRef} style={style} className="group/volume mb-0.5">
          <div className="relative overflow-hidden rounded-lg px-2 py-0.5 transition-colors hover:bg-accent min-h-[26px]">
            <div className="flex items-center gap-1.5 w-full min-w-0">
              <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className={cn(
                      'flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5 hover:bg-accent rounded transition-opacity',
                      'opacity-50 group-hover/volume:opacity-100',
                    )}
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
                          onRename(volume)
                          setPopoverOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {t('editor.leftPanel.chapters.volumeItem.rename')}
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
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('editor.leftPanel.chapters.volumeItem.delete')}
                      </button>
                    )}
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              <button
                type="button"
                onClick={onToggle}
                className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
              >
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200 ease-out',
                    !isExpanded && '-rotate-90',
                  )}
                />
              </button>

              <div
                className="flex-1 min-w-0 cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => {
                  setVolumeAttachmentDragData(e.dataTransfer, {
                    id: volume.id,
                    title: volume.title,
                  })
                }}
                onClick={onToggle}
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <h3 className="text-[12px] font-medium text-foreground truncate leading-snug">
                    {volume.title}
                  </h3>
                </div>
              </div>

              {/* 章节数：hover 时让位给操作按钮 */}
              {typeof chapterCount === 'number' && (
                <span
                  className={cn(
                    'ml-1 shrink-0 text-[10px] tabular-nums whitespace-nowrap transition-opacity',
                    'text-muted-foreground/70',
                    'group-hover/volume:opacity-0',
                  )}
                  title={t('editor.leftPanel.chapters.volumeItem.chapterCount', { count: chapterCount })}
                >
                  {t('editor.leftPanel.chapters.volumeItem.chapterCount', { count: chapterCount })}
                </span>
              )}
            </div>

            <HoverActionBar group="volume">
              {onCreateChapter && (
                <HoverActionButton
                  group="volume"
                  label={t('editor.leftPanel.chapters.volumeItem.addChapter')}
                  onClick={() => onCreateChapter(volume.id)}
                  delayMs={0}
                >
                  <BookOpen className="h-2.5 w-2.5" />
                </HoverActionButton>
              )}
              {onRename && (
                <HoverActionButton
                  group="volume"
                  label={t('editor.leftPanel.chapters.volumeItem.editVolumeName')}
                  onClick={() => onRename(volume)}
                  delayMs={45}
                >
                  <Edit2 className="h-2.5 w-2.5" />
                </HoverActionButton>
              )}
              {onDelete && (
                <HoverActionButton
                  group="volume"
                  label={t('editor.leftPanel.chapters.volumeItem.deleteVolume')}
                  onClick={() => onDelete(volume)}
                  delayMs={90}
                  variant="destructive"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </HoverActionButton>
              )}
            </HoverActionBar>
          </div>

          {children && (
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-200 ease-out',
                isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="ml-3 border-l border-border pl-1.5 mt-0.5 space-y-0.5">
                  {children}
                </div>
              </div>
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {onCreateChapter && (
          <ContextMenuItem
            onClick={(e: MouseEvent) => {
              e.stopPropagation()
              onCreateChapter(volume.id)
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
          >
            <BookOpen className="w-2.5 h-2.5" />
            {t('editor.leftPanel.chapters.volumeItem.addChapter')}
          </ContextMenuItem>
        )}
        {onRename && (
          <ContextMenuItem
            onClick={(e: MouseEvent) => {
              e.stopPropagation()
              onRename(volume)
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
          >
            <Edit2 className="w-2.5 h-2.5" />
            {t('editor.leftPanel.chapters.volumeItem.editVolumeName')}
          </ContextMenuItem>
        )}
        {onDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                onDelete(volume)
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="w-2.5 h-2.5" />
              {t('editor.leftPanel.chapters.volumeItem.deleteVolume')}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
