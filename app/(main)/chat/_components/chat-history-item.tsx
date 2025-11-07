'use client'

import {
  Check,
  Edit3,
  MessageCircle,
  MoreHorizontal,
  Pin,
  PinOff,
  Share2,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
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

  return (
    <div
      className="group relative w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing
        ? (
            <div className={cn(
              'flex items-center gap-1 px-3 py-2 relative',
              chat.isPinned && 'before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-purple-500 before:rounded-full',
            )}
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleRenameSubmit}
                disabled={isRenaming}
                className="h-7 text-sm flex-1 min-w-0"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleRenameSubmit}
                disabled={isRenaming}
                className="h-7 w-7 flex-shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleRenameCancel}
                disabled={isRenaming}
                className="h-7 w-7 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )
        : (
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start px-3 py-2 h-9 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 relative transition-colors overflow-hidden',
                isActive && 'bg-white dark:bg-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-700',
                chat.isPinned && 'before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-purple-500 before:rounded-full',
              )}
              onClick={handleClick}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[calc(100%-2.5rem)]">
                <MessageCircle className={cn(
                  'w-4 h-4 flex-shrink-0',
                  isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400',
                )}
                />
                <span className={cn(
                  'text-sm truncate block',
                  isActive ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-700 dark:text-gray-300',
                )}
                >
                  {chat.title}
                </span>
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
                'absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity duration-200 z-10',
                shouldShowButton ? 'opacity-100' : 'opacity-0 pointer-events-none',
              )}
              onClick={e => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2" onClick={handlePinClick}>
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
            <DropdownMenuItem className="gap-2">
              <Share2 className="w-4 h-4" />
              <span>分享</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={handleRenameClick}>
              <Edit3 className="w-4 h-4" />
              <span>重命名</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-red-600 dark:text-red-400"
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
        <DialogContent>
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
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
