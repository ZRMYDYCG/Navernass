'use client'

import type { NovelConversation } from '@/lib/supabase/sdk/types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MessageSquare, Pin, Trash2, X } from 'lucide-react'
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
import { Spinner } from '@/components/ui/spinner'

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
        locale: zhCN,
      })
    } catch {
      return ''
    }
  }

  const pinnedConversations = conversations.filter(c => c.is_pinned)
  const unpinnedConversations = conversations.filter(c => !c.is_pinned)

  return (
    <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-xl">
      {/* 头部 */}
      <div className="h-12 flex px-4 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">历史对话</h3>
          {conversations.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (
              {conversations.length}
              )
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 会话列表 */}
      <ScrollArea className="flex-1">
        {conversations.length === 0
          ? (
              <div className="flex flex-col items-center justify-center h-full px-4 py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">暂无历史对话</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">开始新的对话吧</p>
              </div>
            )
          : (
              <div className="py-2">
                {/* 置顶会话 */}
                {pinnedConversations.length > 0 && (
                  <div className="px-2 mb-2">
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      置顶
                    </div>
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

                {/* 未置顶会话 */}
                {unpinnedConversations.length > 0 && (
                  <div className="px-2">
                    {pinnedConversations.length > 0 && (
                      <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        最近
                      </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除对话</DialogTitle>
            <DialogDescription>
              确定要删除这个对话吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              删除
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
      className={`group relative mx-2 mb-1 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
        isActive
          ? 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5">
          <MessageSquare
            className={`w-4 h-4 ${
              isActive
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {conversation.is_pinned && (
                  <Pin className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-current flex-shrink-0" />
                )}
                <span
                  className={`text-sm font-medium truncate ${
                    isActive
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {conversation.title}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(conversation.updated_at)}
              </div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {onPin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePin}
                  disabled={isPinning}
                  className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  title={conversation.is_pinned ? '取消置顶' : '置顶'}
                >
                  {isPinning
                    ? (
                        <Spinner className="w-3.5 h-3.5" />
                      )
                    : (
                        <Pin
                          className={`w-3.5 h-3.5 ${
                            conversation.is_pinned
                              ? 'text-amber-500 dark:text-amber-400 fill-current'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        />
                      )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
