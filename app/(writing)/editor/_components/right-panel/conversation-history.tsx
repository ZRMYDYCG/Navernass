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
    <div className="absolute inset-0 z-50 bg-background border-l border-border flex flex-col shadow-none">
      {/* 头部 */}
      <div className="h-10 flex px-4 items-center justify-between border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">历史对话</h3>
          {conversations.length > 0 && (
            <span className="text-xs text-muted-foreground">
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
          className="h-7 w-7 p-0 hover:bg-accent text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 会话列表 */}
      <ScrollArea className="flex-1">
        {conversations.length === 0
          ? (
              <div className="flex flex-col items-center justify-center h-full px-4 py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-1">暂无历史对话</p>
                <p className="text-xs text-muted-foreground/70">开始新的对话吧</p>
              </div>
            )
          : (
              <div className="py-2">
                {/* 置顶会话 */}
                {pinnedConversations.length > 0 && (
                  <div className="px-2 mb-1">
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>删除对话</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              确定要删除这个对话吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel} className="border-border">
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
    <button
      type="button"
      onClick={onSelect}
      className={`w-full px-2.5 py-1.5 hover:bg-accent rounded-lg border border-transparent hover:border-border transition-all text-left flex items-center gap-2.5 cursor-pointer group ${
        isActive
          ? 'bg-card border-border shadow-sm'
          : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          {conversation.is_pinned && (
            <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />
          )}
          <span className="text-xs font-medium truncate text-foreground group-hover:text-foreground">
            {conversation.title || '无标题对话'}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground group-hover:text-muted-foreground">
          {formatTime(conversation.updated_at)}
        </div>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {onPin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePin}
            disabled={isPinning}
            className="h-6 w-6 p-0 hover:bg-accent disabled:opacity-50 text-muted-foreground hover:text-foreground"
            title={conversation.is_pinned ? '取消置顶' : '置顶'}
          >
            {isPinning
              ? (
                  <Spinner className="w-3 h-3" />
                )
              : (
                  <Pin
                    className={`w-3 h-3 ${
                      conversation.is_pinned
                        ? 'text-amber-500 fill-current'
                        : 'text-muted-foreground'
                    }`}
                  />
                )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
          title="删除"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </button>
  )
}
