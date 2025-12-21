'use client'

import type { Dispatch, SetStateAction } from 'react'
import {
  MoreHorizontal,
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
        <div className="relative hidden md:block">
          <Input
            type="text"
            placeholder={UI_CONFIG.search.placeholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-64`}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setIsSelectionMode(true)}
            >
              <span>选择对话</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>查看已置顶</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>按日期排序</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSelectAll}
        className="text-muted-foreground"
      >
        {selectedChats.size === 0 ? '全选' : '取消全选'}
      </Button>

      <span className="text-sm text-muted-foreground">
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
            className="text-muted-foreground"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleBatchPin}
            disabled={selectedChats.size === 0}
          >
            <span>批量置顶</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleBatchShare}
            disabled={selectedChats.size === 0}
          >
            <span>批量分享</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 dark:text-red-400"
            onClick={handleBatchDelete}
            disabled={selectedChats.size === 0}
          >
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
        className="text-muted-foreground"
      >
        取消
      </Button>
    </div>
  )
}
