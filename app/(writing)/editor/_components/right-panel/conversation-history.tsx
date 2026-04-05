'use client'

import type { NovelConversation } from '@/lib/supabase/sdk/types'
import { formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n, useLocale } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface ConversationHistoryProps {
  conversations: NovelConversation[]
  currentConversationId?: string
  onSelect: (conversation: NovelConversation) => void
  onDelete: (conversationId: string) => void
  onPin?: (conversationId: string, isPinned: boolean) => void
  onClose: () => void
}

export function ConversationHistory({
  conversations,
  currentConversationId,
  onSelect,
  onDelete,
  onPin,
  onClose,
}: ConversationHistoryProps) {
  const { t } = useI18n()
  const { locale } = useLocale()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    setConversationToDelete(conversationId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (conversationToDelete) {
      onDelete(conversationToDelete)
      setDeleteDialogOpen(false)
      setConversationToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setConversationToDelete(null)
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: locale === 'zh-CN' ? zhCN : enUS,
      })
    } catch {
      return ''
    }
  }

  const pinnedConversations = conversations.filter(c => c.is_pinned)
  const unpinnedConversations = conversations.filter(c => !c.is_pinned)

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col">
      {/* 头部 - 极简/紧凑 */}
      <div className="h-9 flex px-3 items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">{t('editor.rightPanel.history.title')}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
        >
          {t('editor.rightPanel.history.close')}
        </Button>
      </div>

      {/* 会话列表 */}
      <ScrollArea className="flex-1">
        {conversations.length === 0
          ? (
              <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-muted-foreground">
                <p className="text-xs">{t('editor.rightPanel.history.empty')}</p>
              </div>
            )
          : (
              <div className="flex flex-col pb-4 px-2">
                {/* 置顶会话 */}
                {pinnedConversations.length > 0 && (
                  <div className="flex flex-col mb-2">
                    {pinnedConversations.map(conversation => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={currentConversationId === conversation.id}
                        onSelect={() => onSelect(conversation)}
                        onDelete={e => handleDeleteClick(e, conversation.id)}
                        onPin={onPin}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                )}

                {/* 普通会话 */}
                {unpinnedConversations.length > 0 && (
                  <div className="flex flex-col">
                    {pinnedConversations.length > 0 && (
                      <div className="px-2 py-1 text-[10px] text-muted-foreground/50 font-medium">{t('editor.rightPanel.history.recent')}</div>
                    )}
                    {unpinnedConversations.map(conversation => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={currentConversationId === conversation.id}
                        onSelect={() => onSelect(conversation)}
                        onDelete={e => handleDeleteClick(e, conversation.id)}
                        onPin={onPin}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
      </ScrollArea>

      {/* 删除确认 Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('editor.rightPanel.history.deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('editor.rightPanel.history.deleteDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              {t('editor.rightPanel.history.deleteDialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t('editor.rightPanel.history.deleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ConversationItemProps {
  conversation: NovelConversation
  isActive: boolean
  onSelect: () => void
  onDelete: (e: React.MouseEvent) => void
  onPin?: (conversationId: string, isPinned: boolean) => void
  formatTime: (dateString: string) => string
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onPin,
  formatTime,
}: ConversationItemProps) {
  const { t } = useI18n()
  const [isPinning, setIsPinning] = useState(false)

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onPin || isPinning) return

    setIsPinning(true)
    try {
      await onPin(conversation.id, !conversation.is_pinned)
    } finally {
      setIsPinning(false)
    }
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex items-center justify-between px-2 py-1.5 cursor-pointer transition-colors rounded-sm',
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <div className="flex-1 min-w-0 pr-2 overflow-hidden">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            'text-xs truncate transition-colors',
            isActive ? 'font-medium text-foreground' : 'font-normal',
          )}
          >
            {conversation.title || t('editor.rightPanel.untitledConversation')}
          </span>
          {conversation.is_pinned && (
            <span className="text-[10px] text-primary/70 shrink-0">
              *
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-muted-foreground/50">
          {formatTime(conversation.updated_at)}
        </span>
        {onPin && (
          <button
            onClick={handlePin}
            disabled={isPinning}
            className="text-[10px] text-muted-foreground hover:text-foreground hover:underline disabled:opacity-50"
          >
            {isPinning ? '...' : (conversation.is_pinned ? t('editor.rightPanel.history.unpinShort') : t('editor.rightPanel.history.pinShort'))}
          </button>
        )}
        <button
          onClick={onDelete}
          className="text-[10px] text-muted-foreground hover:text-destructive hover:underline"
        >
          {t('editor.rightPanel.history.deleteShort')}
        </button>
      </div>
    </div>
  )
}
