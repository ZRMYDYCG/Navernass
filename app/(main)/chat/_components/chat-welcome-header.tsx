'use client'

import {
  Bell,
  PanelLeftOpen,
  PencilLine,
  Share2,
} from 'lucide-react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { conversationsApi } from '@/lib/supabase/sdk'
import { useChatSidebar } from './chat-sidebar-provider'
import { EditChatTitleDialog } from './edit-chat-title-dialog'

interface ChatWelcomeHeaderProps {
  onShareConversation?: () => void
  isShareMode?: boolean
}

export function ChatWelcomeHeader(props: ChatWelcomeHeaderProps = {}) {
  const { onShareConversation, isShareMode = false } = props
  const { isOpen, open, updateConversationTitle, onTitleUpdate } = useChatSidebar()
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()

  const conversationId = params?.id as string | undefined
  const isNewChatPage = pathname === '/chat'
  const isConversationPage = !!conversationId

  // 对话标题编辑状态
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [chatTitle, setChatTitle] = useState('新建对话')
  const [isLoadingTitle, setIsLoadingTitle] = useState(false)

  useEffect(() => {
    const loadConversationTitle = async () => {
      if (!conversationId) return

      try {
        setIsLoadingTitle(true)
        const conversation = await conversationsApi.getById(conversationId)
        if (conversation) {
          setChatTitle(conversation.title)
        }
      } catch (error) {
        console.error('Failed to load conversation title:', error)
        setChatTitle('对话')
      } finally {
        setIsLoadingTitle(false)
      }
    }

    loadConversationTitle()
  }, [conversationId])

  // 监听标题更新（侧边栏修改标题时同步）
  useEffect(() => {
    if (!conversationId) return

    const unsubscribe = onTitleUpdate((updatedConvId, newTitle) => {
      // 只更新当前对话的标题
      if (updatedConvId === conversationId) {
        setChatTitle(newTitle)
      }
    })

    return unsubscribe
  }, [conversationId, onTitleUpdate])

  const handleSaveTitle = useCallback(async (id: string, newTitle: string) => {
    try {
      await conversationsApi.update({ id, title: newTitle })
      setChatTitle(newTitle)
      // 通知侧边栏更新标题
      updateConversationTitle(id, newTitle)
    } catch (error) {
      console.error('Failed to update conversation title:', error)
      throw error
    }
  }, [updateConversationTitle])

  const handleShareClick = useCallback(() => {
    if (onShareConversation) {
      onShareConversation()
      return
    }

    console.warn('分享对话:', conversationId)
  }, [conversationId, onShareConversation])

  return (
    <TooltipProvider>
      <header className="h-16 flex items-center justify-between px-4 bg-background transition-colors">
        <div className="flex items-center gap-3">
          {!isOpen && (
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground cursor-pointer hover:bg-accent"
                    onClick={open}
                    aria-label="打开侧边栏"
                  >
                    <PanelLeftOpen className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>展开侧边栏</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => router.push('/chat')}
                    disabled={isNewChatPage}
                    className="text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed hover:bg-accent"
                    aria-label="新建对话"
                  >
                    <PencilLine className="hidden sm:block w-5 h-5" />
                    <PencilLine className="sm:hidden w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>新建对话</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {isConversationPage && (
            isLoadingTitle
              ? (
                  <Skeleton className="h-8 w-32" />
                )
              : (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      className="text-lg font-semibold text-foreground hover:bg-accent font-serif tracking-wide"
                      onClick={() => setIsEditDialogOpen(true)}
                    >
                      {chatTitle}
                    </Button>

                  </div>
                )
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConversationPage && (
            <>
              {isLoadingTitle
                ? (
                    <Skeleton className="w-8 h-8 rounded-md" />
                  )
                : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isShareMode ? 'secondary' : 'ghost'}
                          size="icon-sm"
                          className="text-muted-foreground hover:text-foreground cursor-pointer aria-pressed:text-primary hover:bg-accent"
                          onClick={handleShareClick}
                          aria-label="分享对话"
                          aria-pressed={isShareMode}
                        >
                          <Share2 className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isShareMode ? '退出分享模式' : '分享对话'}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

              {isLoadingTitle
                ? (
                    <Skeleton className="w-8 h-8 rounded-md" />
                  )
                : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="relative text-muted-foreground hover:text-foreground cursor-pointer hover:bg-accent"
                          onClick={() => router.push('/chat/news')}
                          aria-label="产品更新动态"
                        >
                          <Bell className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>产品更新动态</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
            </>
          )}
        </div>
      </header>

      {/* 编辑标题弹窗 */}
      {conversationId && (
        <EditChatTitleDialog
          key={`${conversationId}-${chatTitle}`}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          currentTitle={chatTitle}
          conversationId={conversationId}
          onSave={handleSaveTitle}
        />
      )}
    </TooltipProvider>
  )
}
