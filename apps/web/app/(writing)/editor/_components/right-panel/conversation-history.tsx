'use client'

import type { NovelConversation } from '@/lib/supabase/sdk/types'
import { Clock, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useI18n, useLocale } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface ConversationHistoryDropdownProps {
  conversations: NovelConversation[]
  currentConversationId?: string
  onSelect: (conversation: NovelConversation) => void
  onDelete: (conversationId: string) => void
  onOpenChange?: (open: boolean) => void
}

function formatCompactTime(dateString: string, locale: string): string {
  try {
    const date = new Date(dateString)
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return locale.startsWith('zh') ? '刚刚' : 'now'
    if (diffMins < 60) return `${diffMins}m`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function ConversationHistoryDropdown({
  conversations,
  currentConversationId,
  onSelect,
  onDelete,
  onOpenChange,
}: ConversationHistoryDropdownProps) {
  const { t } = useI18n()
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)

  const sortedConversations = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...conversations]
      .filter(c => {
        if (!q) return true
        const title = (c.title || t('editor.rightPanel.untitledConversation')).toLowerCase()
        return title.includes(q)
      })
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      })
  }, [conversations, query, t])

  const handleSelect = (conversation: NovelConversation) => {
    onSelect(conversation)
    setOpen(false)
    setQuery('')
  }

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

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          onOpenChange?.(next)
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            title={t('editor.rightPanel.historyButton')}
            className="h-6 w-6 flex items-center justify-center hover:bg-accent rounded-sm transition-all duration-200 text-muted-foreground hover:text-foreground cursor-pointer data-[state=open]:bg-accent data-[state=open]:text-foreground"
            aria-label={t('editor.rightPanel.historyButton')}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={6}
          className="w-[min(320px,calc(100vw-1rem))] rounded-xl border border-border bg-popover p-0 shadow-lg"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('editor.rightPanel.history.searchPlaceholder')}
                className="h-8 pl-8 text-xs bg-muted/50 border-transparent focus-visible:border-input focus-visible:bg-background"
              />
            </div>
          </div>

          <div className="max-h-[min(360px,50vh)] overflow-y-auto overscroll-contain">
            {sortedConversations.length === 0
              ? (
                  <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                    {query.trim() ? t('editor.rightPanel.history.noResults') : t('editor.rightPanel.history.empty')}
                  </div>
                )
              : (
                  <div className="p-1.5 flex flex-col gap-0.5">
                    {sortedConversations.map(conversation => {
                      const isActive = currentConversationId === conversation.id
                      const label = conversation.title || t('editor.rightPanel.untitledConversation')
                      return (
                        <div
                          key={conversation.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelect(conversation)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSelect(conversation)
                            }
                          }}
                          className={cn(
                            'group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-left',
                            isActive
                              ? 'bg-primary/15 text-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                          )}
                        >
                          <span className={cn(
                            'flex-1 min-w-0 truncate text-xs',
                            isActive ? 'font-medium text-foreground' : 'font-normal',
                          )}
                          >
                            {conversation.is_pinned && (
                              <span className="text-primary/70 mr-1">*</span>
                            )}
                            {label}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                            {formatCompactTime(conversation.updated_at, locale)}
                          </span>
                          <button
                            type="button"
                            onClick={e => handleDeleteClick(e, conversation.id)}
                            className="shrink-0 h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                            aria-label={t('editor.rightPanel.history.deleteShort')}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('editor.rightPanel.history.deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('editor.rightPanel.history.deleteDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('editor.rightPanel.history.deleteDialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t('editor.rightPanel.history.deleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
