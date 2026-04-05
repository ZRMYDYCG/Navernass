'use client'

import { Check, Edit3, MoreHorizontal, Pin, PinOff, Trash2, X } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  isMenuOpen: boolean
  onChatClick: (chatId: string) => void
  onMenuOpenChange: (isOpen: boolean) => void
  onDelete: (chatId: string) => void
  onTogglePin: (chatId: string, isPinned: boolean) => void
  onRename: (chatId: string, newTitle: string) => Promise<void>
}

export function ChatHistoryItem({
  chat,
  isActive,
  isMenuOpen,
  onChatClick,
  onMenuOpenChange,
  onDelete,
  onTogglePin,
  onRename,
}: ChatHistoryItemProps) {
  const { t } = useI18n()
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(chat.title)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const titleRef = useRef<HTMLSpanElement>(null)

  // 检测标题是否被截断
  useEffect(() => {
    const checkTruncation = () => {
      if (titleRef.current) {
        setIsTruncated(titleRef.current.scrollWidth > titleRef.current.clientWidth)
      }
    }

    checkTruncation()
    // 监听窗口大小变化
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [chat.title])

  const handleClick = () => {
    if (!isEditing) {
      onChatClick(chat.id)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
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

  const handlePinClick = () => {
    onTogglePin(chat.id, chat.isPinned)
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

  // 「更多」按钮显示条件：hover 或菜单展开
  const shouldShowMore = isHovered || isMenuOpen
  // 置顶图标显示条件：被置顶且没有显示「更多」按钮
  const shouldShowPin = chat.isPinned && !shouldShowMore

  return (
    <TooltipProvider>
      <div
        className="group relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start px-3 py-1.5 h-9 text-left relative transition-colors overflow-hidden cursor-pointer rounded-none pr-10',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )}
                onClick={handleClick}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[calc(100%-2.5rem)]">
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <span
                        ref={titleRef}
                        className={cn(
                          'text-sm truncate block transition-colors',
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
                {shouldShowPin && (
                  <Pin
                    className={cn(
                      'h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 rotate-45 transition-colors',
                      isActive
                        ? 'text-sidebar-foreground'
                        : 'text-muted-foreground group-hover:text-sidebar-foreground',
                    )}
                  />
                )}
              </Button>
            )}

        {/* 更多按钮 - 编辑模式下隐藏 */}
        {!isEditing && (
          <DropdownMenu modal={false} onOpenChange={onMenuOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-accent transition-opacity duration-200 z-20 cursor-pointer h-7 w-7',
                  shouldShowMore ? 'opacity-100' : 'opacity-0 pointer-events-none',
                )}
                onClick={e => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-popover border border-border shadow-paper-md">
              <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent" onClick={handlePinClick}>
                {chat.isPinned
                  ? (
                      <>
                        <PinOff className="w-4 h-4" />
                        <span>{t('chat.historyItem.unpin')}</span>
                      </>
                    )
                  : (
                      <>
                        <Pin className="w-4 h-4" />
                        <span>{t('chat.historyItem.pin')}</span>
                      </>
                    )}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent" onClick={handleRenameClick}>
                <Edit3 className="w-4 h-4" />
                <span>{t('chat.historyItem.rename')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="gap-2 text-destructive cursor-pointer focus:bg-destructive/10"
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('chat.historyItem.delete')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
