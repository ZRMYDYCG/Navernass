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
import { useI18n } from '@/hooks/use-i18n'

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
  const { t } = useI18n()

  if (!isSelectionMode) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Input
            type="text"
            placeholder={t('chat.all.toolbar.searchPlaceholder')}
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
              <span>{t('chat.all.toolbar.selectChats')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>{t('chat.all.toolbar.viewPinned')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>{t('chat.all.toolbar.sortByDate')}</span>
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
      {selectedChats.size === 0 ? t('chat.all.toolbar.selectAll') : t('chat.all.toolbar.deselectAll')}
      </Button>

      <span className="text-sm text-muted-foreground">
      {t('chat.all.toolbar.selected')}
      {' '}
      {selectedChats.size}
      {' '}
      {t('chat.all.toolbar.items')}
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
          <span>{t('chat.all.toolbar.bulkPin')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleBatchShare}
            disabled={selectedChats.size === 0}
          >
          <span>{t('chat.all.toolbar.bulkShare')}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
          className="text-destructive"
            onClick={handleBatchDelete}
            disabled={selectedChats.size === 0}
          >
          <span>{t('chat.all.toolbar.bulkDelete')}</span>
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
      {t('chat.all.toolbar.cancel')}
      </Button>
    </div>
  )
}
