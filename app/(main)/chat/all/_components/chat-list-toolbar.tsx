'use client'

import type { Dispatch, SetStateAction } from 'react'
import {
  Calendar,
  CheckSquare,
  MoreHorizontal,
  Pin,
  Search,
  Share2,
  Square,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { UI_CONFIG } from '../config'

interface ChatListToolbarProps {
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  isSelectionMode: boolean
  setIsSelectionMode: Dispatch<SetStateAction<boolean>>
  selectedChats: Set<string>
  toggleSelectAll: () => void
  handleBatchDelete: () => void
  handleBatchPin: () => void
  handleBatchShare: () => void
}

export function ChatListToolbar({
  searchQuery,
  setSearchQuery,
  isSelectionMode,
  setIsSelectionMode,
  selectedChats,
  toggleSelectAll,
  handleBatchDelete,
  handleBatchPin,
  handleBatchShare,
}: ChatListToolbarProps) {
  if (!isSelectionMode) {
    return (
      <div className="flex items-center gap-2">
        {/* 搜索框 */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder={UI_CONFIG.search.placeholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`pl-9 ${UI_CONFIG.search.width} bg-gray-100 dark:bg-gray-700 border-0 focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none`}
          />
        </div>

        {/* 更多操作 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => setIsSelectionMode(true)}
            >
              <CheckSquare className="w-4 h-4" />
              <span>选择对话</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <Pin className="w-4 h-4" />
              <span>查看已置顶</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Calendar className="w-4 h-4" />
              <span>按日期排序</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* 选择模式操作栏 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSelectAll}
        className="text-gray-600 dark:text-gray-400"
      >
        {selectedChats.size === 0
          ? (
              <>
                <CheckSquare className="w-4 h-4 mr-2" />
                全选
              </>
            )
          : (
              <>
                <Square className="w-4 h-4 mr-2" />
                取消全选
              </>
            )}
      </Button>

      <span className="text-sm text-gray-500 dark:text-gray-400">
        已选择
        {' '}
        {selectedChats.size}
        {' '}
        项
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-gray-600 dark:text-gray-400"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="gap-2 text-blue-600 dark:text-blue-400"
            onClick={handleBatchPin}
            disabled={selectedChats.size === 0}
          >
            <Pin className="w-4 h-4" />
            <span>批量置顶</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={handleBatchShare}
            disabled={selectedChats.size === 0}
          >
            <Share2 className="w-4 h-4" />
            <span>批量分享</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-red-600 dark:text-red-400"
            onClick={handleBatchDelete}
            disabled={selectedChats.size === 0}
          >
            <Trash2 className="w-4 h-4" />
            <span>批量删除</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsSelectionMode(false)
        }}
        className="text-gray-600 dark:text-gray-400"
      >
        取消
      </Button>
    </div>
  )
}
