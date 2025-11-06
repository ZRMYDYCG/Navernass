'use client'

import {
  Bell,
  PanelLeftOpen,
  Plus,
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

export function ChatWelcomeHeader() {
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
    // TODO: 实现分享功能
    console.warn('分享对话:', conversationId)
  }, [conversationId])

  return (
    <TooltipProvider>
      <header className="h-16 flex items-center justify-between px-4 transition-colors">
        <div className="flex items-center gap-3">
          {!isOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
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
          )}

          {isConversationPage
            ? (
                // 对话页面显示标题
                isLoadingTitle
                  ? (
                      <Skeleton className="h-8 w-32" />
                    )
                  : (
                      <Button
                        variant="ghost"
                        className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsEditDialogOpen(true)}
                      >
                        {chatTitle}
                      </Button>
                    )
              )
            : (
                // 首页显示新建对话按钮
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => router.push('/chat')}
                  disabled={isNewChatPage}
                >
                  <Plus className="w-4 h-4" />
                  <span>新建对话</span>
                </Button>
              )}
        </div>

        <div className="flex items-center gap-2">
          {/* 对话页面显示分享按钮 */}
          {isConversationPage && (
            isLoadingTitle
              ? (
                  <Skeleton className="w-8 h-8 rounded-md" />
                )
              : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
                        onClick={handleShareClick}
                        aria-label="分享对话"
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>分享对话</p>
                    </TooltipContent>
                  </Tooltip>
                )
          )}

          {/* 通知按钮 */}
          {isConversationPage && isLoadingTitle
            ? (
                <Skeleton className="w-8 h-8 rounded-md" />
              )
            : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="relative text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
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
