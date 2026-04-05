'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES } from '../config'
import { useI18n } from '@/hooks/use-i18n'
import { ChatListToolbar } from './chat-list-toolbar'

interface ChatListHeaderProps {
  title?: string
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  isSelectionMode: boolean
  setIsSelectionMode: Dispatch<SetStateAction<boolean>>
  selectedChats: Set<string>
  toggleSelectAll: () => void
  handleBatchDelete: () => void
  handleBatchPin: () => void
  handleBatchShare: () => void
  isLoading?: boolean
  chatCount?: number
}

export function ChatListHeader({
  title,
  searchQuery,
  setSearchQuery,
  isSelectionMode,
  setIsSelectionMode,
  selectedChats,
  toggleSelectAll,
  handleBatchDelete,
  handleBatchPin,
  handleBatchShare,
  isLoading = false,
  chatCount = 0,
}: ChatListHeaderProps) {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <header className="flex items-center justify-between p-4 bg-background">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.chat)}
          className="text-muted-foreground hover:text-foreground"
        >
          {t('chat.all.back')}
        </Button>
        <h1 className="text-lg font-semibold text-foreground">
          {title || t('chat.all.title')}
          {!isLoading && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({chatCount})
            </span>
          )}
        </h1>
      </div>
      <ChatListToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        selectedChats={selectedChats}
        toggleSelectAll={toggleSelectAll}
        handleBatchDelete={handleBatchDelete}
        handleBatchPin={handleBatchPin}
        handleBatchShare={handleBatchShare}
      />
    </header>
  )
}
