'use client'

import {
  AlertCircle,
  Check,
  Edit3,
  MessageCircle,
  MoreHorizontal,
  PanelLeftClose,
  Pin,
  PinOff,
  Share2,
  Trash2,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { conversationsApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'
import { useChatSidebar } from './chat-sidebar-provider'

interface ChatHistoryData {
  id: string
  title: string
  isPinned: boolean
  createdAt: Date
}

interface ChatSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const { theme } = useTheme()
  const { onTitleUpdate, updateConversationTitle } = useChatSidebar()
  const currentId = params?.id as string | undefined
  const isNewChatPage = pathname === '/chat'
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'

  // 监听标题更新
  useEffect(() => {
    const unsubscribe = onTitleUpdate((conversationId, newTitle) => {
      setChatHistory(prev =>
        prev.map(chat =>
          chat.id === conversationId ? { ...chat, title: newTitle } : chat,
        ),
      )
    })

    return unsubscribe
  }, [onTitleUpdate])

  // 加载对话历史
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoading(true)
        const conversations = await conversationsApi.getRecent(50)

        // 转换为ChatHistoryData格式
        const historyData: ChatHistoryData[] = conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          isPinned: conv.is_pinned || false,
          createdAt: new Date(conv.created_at),
        }))

        setChatHistory(historyData)
      } catch (error) {
        console.error('Failed to load chat history:', error)
        setChatHistory([])
      } finally {
        setIsLoading(false)
      }
    }

    // 只在侧边栏打开时加载
    if (isOpen) {
      loadChatHistory()
    }
  }, [isOpen])

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    // 在移动端点击后关闭侧边栏
    if (onClose) {
      onClose()
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await conversationsApi.delete(chatId)
      // 从列表中移除
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId))

      // 如果删除的是当前对话，跳转到聊天首页
      if (currentId === chatId) {
        router.push('/chat')
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      // TODO: 显示错误提示
    }
  }

  const handleTogglePin = async (chatId: string, isPinned: boolean) => {
    try {
      await conversationsApi.update({ id: chatId, is_pinned: !isPinned })
      // 更新本地状态
      setChatHistory(prev =>
        prev.map(chat =>
          chat.id === chatId ? { ...chat, isPinned: !isPinned } : chat,
        ).sort((a, b) => {
          // 置顶的对话排在前面
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          // 都置顶或都不置顶，按创建时间排序
          return b.createdAt.getTime() - a.createdAt.getTime()
        }),
      )
    } catch (error) {
      console.error('Failed to toggle pin:', error)
      // TODO: 显示错误提示
    }
  }

  const handleRename = async (chatId: string, newTitle: string) => {
    try {
      await conversationsApi.update({ id: chatId, title: newTitle })
      // 更新本地状态
      setChatHistory(prev =>
        prev.map(chat => (chat.id === chatId ? { ...chat, title: newTitle } : chat)),
      )
      // 通知会话区域更新标题
      updateConversationTitle(chatId, newTitle)
    } catch (error) {
      console.error('Failed to rename conversation:', error)
      // TODO: 显示错误提示
      throw error
    }
  }

  return (
    <TooltipProvider>
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden"
            onClick={onClose}
            aria-label="关闭侧边栏"
          />
        )}

        <aside
          className={cn(
            'fixed lg:relative top-0 left-0 h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col',
            // 移动端：固定宽度 + transform
            'w-72 transition-transform duration-300',
            // 桌面端：宽度变化动画
            'lg:transition-all lg:duration-300',
            // 显示/隐藏控制
            isOpen
              ? 'translate-x-0 lg:w-72'
              : '-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden',
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarSrc} alt="Narraverse" />
              </Avatar>
              <span className="font-medium text-gray-800 dark:text-gray-100">Narraverse</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              onClick={onClose}
              aria-label="收起侧边栏"
            >
              <PanelLeftClose className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2.5 font-normal relative overflow-hidden group
              bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10
              hover:from-blue-500/15 hover:via-purple-500/15 hover:to-pink-500/15
              backdrop-blur-sm
              border border-gray-200/50 dark:border-gray-700/50
              text-gray-700 dark:text-gray-200
              transition-all duration-200"
              onClick={() => window.location.href = '/chat'}
              disabled={isNewChatPage}
            >
              <Edit3 className="w-4 h-4 relative z-10" />
              <span className="relative z-10">新对话</span>
              <span className="ml-auto text-xs text-gray-400 dark:text-gray-400 font-normal relative z-10">Ctrl K</span>
            </Button>
          </div>

          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 group">
            <span>历史对话</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => router.push('/chat/all')}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>查看全部对话</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {isLoading
                ? (
                    <div className="space-y-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="flex items-center gap-2 px-3 py-2">
                          <Skeleton className="w-4 h-4 rounded-sm flex-shrink-0 bg-gray-300 dark:bg-gray-700" />
                          <Skeleton className="h-4 flex-1 bg-gray-300 dark:bg-gray-700" />
                        </div>
                      ))}
                    </div>
                  )
                : chatHistory.length === 0
                  ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        还没有对话历史
                      </div>
                    )
                  : (
                      chatHistory.map(chat => (
                        <ChatHistoryItem
                          key={chat.id}
                          chat={chat}
                          isActive={currentId === chat.id}
                          isMenuOpen={menuOpenId === chat.id}
                          onChatClick={handleChatClick}
                          onMenuOpenChange={isOpen => setMenuOpenId(isOpen ? chat.id : null)}
                          onDelete={handleDeleteChat}
                          onTogglePin={handleTogglePin}
                          onRename={handleRename}
                        />
                      ))
                    )}
            </div>
          </ScrollArea>
        </aside>
      </>
    </TooltipProvider>
  )
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

function ChatHistoryItem({
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
      className="group relative"
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
                'w-full justify-start px-3 py-2 h-auto text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 relative transition-colors',
                isActive && 'bg-white dark:bg-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-700',
                chat.isPinned && 'before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-purple-500 before:rounded-full',
              )}
              onClick={handleClick}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-8">
                <MessageCircle className={cn(
                  'w-4 h-4 flex-shrink-0',
                  isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400',
                )}
                />
                <span className={cn(
                  'text-sm truncate flex-1',
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
                'absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity duration-200',
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
