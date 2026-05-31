'use client'

import type { NovelConversation } from '@/lib/supabase/sdk'
import { MessageSquarePlus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { ConversationHistoryDropdown } from './conversation-history'

interface HeaderProps {
  onNewChat?: () => void
  isNewChatActive?: boolean
  conversations: NovelConversation[]
  currentConversationId?: string
  onSelectConversation: (conversation: NovelConversation) => void
  onDeleteConversation: (conversationId: string) => void
}

export function Header({
  onNewChat,
  isNewChatActive = false,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
}: HeaderProps) {
  const { t } = useI18n()
  const currentConversation = conversations.find(c => c.id === currentConversationId)
  const title = currentConversation?.title?.trim()
    || t('editor.rightPanel.untitledConversation')

  return (
    <div className="h-9 flex px-2 items-center justify-between gap-2 bg-background min-w-0">
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-xs',
          currentConversation ? 'text-muted-foreground' : 'text-muted-foreground/70',
        )}
        title={title}
      >
        {title}
      </span>
      <TooltipProvider>
        <div className="flex items-center gap-0.5 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <button
                  type="button"
                  disabled={isNewChatActive}
                  onClick={onNewChat}
                  className={cn(
                    'h-6 w-6 flex items-center justify-center rounded-sm transition-all duration-200',
                    isNewChatActive
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer',
                  )}
                  aria-label={t('editor.rightPanel.newChat')}
                  aria-disabled={isNewChatActive}
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isNewChatActive
                  ? t('editor.rightPanel.newChatAlreadyActive')
                  : t('editor.rightPanel.newChat')}
              </p>
            </TooltipContent>
          </Tooltip>
          <ConversationHistoryDropdown
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelect={onSelectConversation}
            onDelete={onDeleteConversation}
          />
        </div>
      </TooltipProvider>
    </div>
  )
}
