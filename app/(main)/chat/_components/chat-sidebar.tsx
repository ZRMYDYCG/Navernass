'use client'

import {
  AlertCircle,
  Bookmark,
  Edit3,
  Flag,
  MessageCircle,
  MoreHorizontal,
  PanelLeftClose,
  Pin,
  Share2,
  Trash2,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ChatHistoryData {
  id: string
  title: string
  isPinned?: boolean
  createdAt: Date
}

interface ChatSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'
  const [chatHistory] = useState<ChatHistoryData[]>(() => [
    { id: '1', title: '创建故事了背景', isPinned: false, createdAt: new Date() },
    { id: '2', title: '实现故事了背景效果', isPinned: false, createdAt: new Date() },
    { id: '3', title: '生成 🔥 置顶', isPinned: true, createdAt: new Date() },
    { id: '4', title: '组件##', isPinned: false, createdAt: new Date() },
    { id: '5', title: '创建##', isPinned: false, createdAt: new Date() },
    { id: '6', title: '组件##', isPinned: false, createdAt: new Date() },
    { id: '7', title: '组件##', isPinned: false, createdAt: new Date() },
    { id: '8', title: '解决地图放大遗出地图面问题', isPinned: false, createdAt: new Date() },
    { id: '9', title: '优化 3D 地图效果', isPinned: false, createdAt: new Date() },
    { id: '10', title: '调整地图配色和样式', isPinned: false, createdAt: new Date() },
    { id: '11', title: '修改 logo 区域文字颜色', isPinned: false, createdAt: new Date() },
    { id: '12', title: '重构顶部导航组件', isPinned: false, createdAt: new Date() },
    { id: '13', title: 'Translation Request', isPinned: false, createdAt: new Date() },
    { id: '14', title: 'Biome 使用指南', isPinned: false, createdAt: new Date() },
    { id: '15', title: 'Add Logging Tool Module', isPinned: false, createdAt: new Date() },
    { id: '16', title: 'Function Format Conversion', isPinned: false, createdAt: new Date() },
    { id: '17', title: 'Add Incremental Builds', isPinned: false, createdAt: new Date() },
    { id: '18', title: 'Translate to English', isPinned: false, createdAt: new Date() },
    { id: '19', title: 'Add Packaged Products to ...', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },
    { id: '20', title: 'Translation Task', isPinned: false, createdAt: new Date() },

  ])

  const handleChatClick = (chatId: string) => {
    setActiveId(chatId)
    router.push(`/chat/${chatId}`)
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
              {chatHistory.map(chat => (
                <ChatHistoryItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeId === chat.id}
                  isMenuOpen={menuOpenId === chat.id}
                  onChatClick={handleChatClick}
                  onMenuOpenChange={isOpen => setMenuOpenId(isOpen ? chat.id : null)}
                />
              ))}
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
}

function ChatHistoryItem({
  chat,
  isActive,
  isMenuOpen,
  onChatClick,
  onMenuOpenChange,
}: ChatHistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    onChatClick(chat.id)
  }

  const shouldShowButton = isHovered || isActive || isMenuOpen

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start px-3 py-2 h-auto text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 relative transition-colors',
          isActive && 'bg-white dark:bg-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-700',
        )}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
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
          <DropdownMenuItem className="gap-2">
            <Pin className="w-4 h-4" />
            <span>置顶</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Share2 className="w-4 h-4" />
            <span>分享</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Bookmark className="w-4 h-4" />
            <span>收藏</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Edit3 className="w-4 h-4" />
            <span>重命名</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Flag className="w-4 h-4" />
            <span>举报</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="w-4 h-4" />
            <span>删除</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
