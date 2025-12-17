'use client'

import {
  Check,
  Edit3,
  MessageCircle,
  MoreHorizontal,
  Pin,
  PinOff,
  Trash2,
  X,
} from 'lucide-react'
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

  const shouldShowButton = isHovered || isActive || isMenuOpen

  const LeadingIcon = chat.isPinned ? Pin : MessageCircle

  return (
    <TooltipProvider>
      <div
        className="group relative w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isEditing
          ? (
              <div className="flex items-center gap-1 px-3 py-2 relative">
                <LeadingIcon
                  className={cn(
                    'w-4 h-4 shrink-0 text-muted-foreground',
                    chat.isPinned && 'rotate-45',
                  )}
                />
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleRenameSubmit}
                  disabled={isRenaming}
                  className="h-7 text-sm flex-1 min-w-0 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleRenameSubmit}
                  disabled={isRenaming}
                  className="h-7 w-7 shrink-0 cursor-pointer disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleRenameCancel}
                  disabled={isRenaming}
                  className="h-7 w-7 shrink-0 cursor-pointer disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )
          : (
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start px-3 py-2 h-9 text-left hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-all duration-200 overflow-hidden cursor-pointer rounded-lg',
                  isActive && 'bg-gray-200 dark:bg-gray-800 shadow-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:shadow-md',
                )}
                onClick={handleClick}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[calc(100%-2.5rem)]">
                  <LeadingIcon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      chat.isPinned && 'rotate-45',
                      isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/80',
                    )}
                  />
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <span
                        ref={titleRef}
                        className={cn(
                          'text-sm truncate block transition-colors',
                          isActive ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground',
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
                  'absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-opacity duration-200 z-10 cursor-pointer h-7 w-7',
                  shouldShowButton ? 'opacity-100' : 'opacity-0 pointer-events-none',
                )}
                onClick={e => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-paper-md">
              <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700" onClick={handlePinClick}>
                {chat.isPinned
                  ? (
                      <>
                        <PinOff className="w-4 h-4" />
                        <span>取消置顶</span>
                      </>
                    )
                  : (
                      <>
                        <Pin className="w-4 h-4" />
                        <span>置顶</span>
                      </>
                    )}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700" onClick={handleRenameClick}>
                <Edit3 className="w-4 h-4" />
                <span>重命名</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem
                className="gap-2 text-destructive cursor-pointer focus:bg-red-100 dark:focus:bg-red-900/20"
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* 删除确认对话框 */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle>删除对话</DialogTitle>
              <DialogDescription>
                确定要删除「
                {chat.title}
                」吗？此操作无法撤销，所有消息记录都将被永久删除。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                {isDeleting ? '删除中...' : '确认删除'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
