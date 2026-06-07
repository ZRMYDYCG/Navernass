'use client'

import type { KeyboardEvent, MouseEvent } from 'react'
import { Check, Edit3, Loader2, Pin, PinOff, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

export interface ChatHistoryData {
  id: string
  title: string
  isPinned: boolean
  createdAt: Date
}

interface ChatHistoryItemProps {
  chat: ChatHistoryData
  isActive: boolean
  isStreaming?: boolean
  onChatClick: (chatId: string) => void
  onDelete: (chatId: string) => void
  onTogglePin: (chatId: string, isPinned: boolean) => void
  onRename: (chatId: string, newTitle: string) => Promise<void>
}

/**
 * 单条历史对话。hover（或 active）时右侧浮出 Pin / Edit / Trash 三个按钮，
 * 模仿小说编辑器左侧世界观列表的"每项浮动操作"模式——避免每次操作都要打开 dropdown。
 */
export function ChatHistoryItem({
  chat,
  isActive,
  isStreaming = false,
  onChatClick,
  onDelete,
  onTogglePin,
  onRename,
}: ChatHistoryItemProps) {
  const { t } = useI18n()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(chat.title)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const titleRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const checkTruncation = () => {
      if (titleRef.current) {
        setIsTruncated(titleRef.current.scrollWidth > titleRef.current.clientWidth)
      }
    }

    checkTruncation()
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [chat.title, isEditing])

  const handleClick = () => {
    if (!isEditing) {
      onChatClick(chat.id)
    }
  }

  const handleRowKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const handleActionClick = (e: MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(chat.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRenameClick = () => {
    setIsEditing(true)
    setEditTitle(chat.title)
  }

  const handleRenameSubmit = async () => {
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle || trimmedTitle === chat.title) {
      setIsEditing(false)
      setEditTitle(chat.title)
      return
    }

    try {
      setIsRenaming(true)
      await onRename(chat.id, trimmedTitle)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to rename:', error)
      setEditTitle(chat.title)
    } finally {
      setIsRenaming(false)
    }
  }

  const handleRenameCancel = () => {
    setIsEditing(false)
    setEditTitle(chat.title)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleRenameCancel()
    }
  }

  // active 状态下常驻可见；否则 hover/focus 时从右侧滑入浮出
  const actionVisibility = cn(
    'transition-all duration-200 ease-out',
    isActive
      ? 'translate-x-0 opacity-100'
      : 'translate-x-2 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-within/item:translate-x-0 group-focus-within/item:opacity-100',
  )

  return (
    <TooltipProvider>
      <div className="group/item relative w-full">
        {isEditing
          ? (
              <div className="flex items-center gap-1 px-3 py-2 relative">
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleRenameSubmit}
                  disabled={isRenaming}
                  className="h-7 text-sm flex-1 min-w-0 bg-card border-border focus-visible:ring-ring"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleRenameSubmit}
                  disabled={isRenaming}
                  className="h-7 w-7 shrink-0 cursor-pointer disabled:cursor-not-allowed hover:bg-accent"
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleRenameCancel}
                  disabled={isRenaming}
                  className="h-7 w-7 shrink-0 cursor-pointer disabled:cursor-not-allowed hover:bg-accent"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )
          : (
              <div
                role="button"
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={handleRowKeyDown}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-full flex justify-start items-center px-3 py-1.5 h-9 text-left relative overflow-hidden cursor-pointer rounded-none focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 mr-1">
                  {isStreaming && (
                    <span
                      className={cn(
                        'shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary',
                        isActive && 'bg-primary/20',
                      )}
                      aria-label={t('chat.historyItem.streaming')}
                    >
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="hidden sm:inline">{t('chat.historyItem.streaming')}</span>
                    </span>
                  )}
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <span
                        ref={titleRef}
                        className={cn(
                          'text-sm truncate block transition-colors flex-1 min-w-0',
                          isActive && 'font-medium',
                        )}
                      >
                        {chat.title}
                      </span>
                    </TooltipTrigger>
                    {isTruncated && (
                      <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                        <p>{chat.title}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>

                {/* 浮动操作：pin / rename / delete（hover or active 可见） */}
                <div className={cn('flex items-center gap-0.5 shrink-0', actionVisibility)}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent"
                        onClick={e => handleActionClick(e, () => onTogglePin(chat.id, chat.isPinned))}
                        aria-label={chat.isPinned ? t('chat.historyItem.unpin') : t('chat.historyItem.pin')}
                      >
                        {chat.isPinned
                          ? <PinOff className="h-3.5 w-3.5" />
                          : <Pin className="h-3.5 w-3.5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {chat.isPinned ? t('chat.historyItem.unpin') : t('chat.historyItem.pin')}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent"
                        onClick={e => handleActionClick(e, handleRenameClick)}
                        aria-label={t('chat.historyItem.rename')}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {t('chat.historyItem.rename')}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={e => handleActionClick(e, () => setShowDeleteDialog(true))}
                        aria-label={t('chat.historyItem.delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {t('chat.historyItem.delete')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

        {/* 删除确认对话框 */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-popover border-border">
            <DialogHeader>
              <DialogTitle>{t('chat.historyItem.deleteDialog.title')}</DialogTitle>
              <DialogDescription>
                {t('chat.historyItem.deleteDialog.descriptionPrefix')}
                {chat.title}
                {t('chat.historyItem.deleteDialog.descriptionSuffix')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                {t('chat.historyItem.deleteDialog.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                {isDeleting ? t('chat.historyItem.deleteDialog.deleting') : t('chat.historyItem.deleteDialog.confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
