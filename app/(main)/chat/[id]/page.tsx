'use client'

import type { ImperativePanelHandle } from 'react-resizable-panels'
import type { Message } from '@/lib/supabase/sdk/types'

import { toPng } from 'html-to-image'
import { Copy, Image as ImageIcon, Link2, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { chatApi, conversationsApi, messagesApi } from '@/lib/supabase/sdk'
import { copyTextToClipboard } from '@/lib/utils'
import { ChatInputBox } from '../_components/chat-input-box'
import { ChatWelcomeHeader } from '../_components/chat-welcome-header'
import { DocumentEditor } from './_components/document-editor'
import { MessageList } from './_components/message-list'
import { ShareImageRenderer } from './_components/share-image-renderer'

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [isShareMode, setIsShareMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([])
  const [conversationTitle, setConversationTitle] = useState('Narraverse 对话')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [showDocumentEditor, setShowDocumentEditor] = useState(false)
  const shareImageRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<ImperativePanelHandle>(null)

  const validSelectedMessageIds = useMemo(() => {
    if (!isShareMode) return []

    const messageIdSet = new Set(messages.map(msg => msg.id))
    return selectedMessageIds.filter(id => messageIdSet.has(id))
  }, [isShareMode, messages, selectedMessageIds])

  const selectedMessagesForImage = useMemo(
    () => messages.filter(msg => validSelectedMessageIds.includes(msg.id)),
    [messages, validSelectedMessageIds],
  )

  // 使用 ref 避免重复处理
  const isProcessingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  // 记录是否已初始化
  const hasInitializedRef = useRef(false)

  // 加载对话历史
  const loadConversationHistory = async (id: string) => {
    try {
      const historyMessages = await messagesApi.getByConversationId(id)
      setMessages(historyMessages)
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      setMessages([])
    }
  }

  // 处理用户发送消息
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || isProcessingRef.current) return
    if (!conversationId) return

    // 设置处理标志
    isProcessingRef.current = true
    setIsLoading(true)

    // 取消之前的请求（如果有）
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    let aiMessageId: string | null = null
    let accumulatedContent = ''

    // 添加用户消息到UI
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      user_id: 'default-user',
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      await chatApi.sendMessageStream(
        {
          conversationId,
          message: content.trim(),
        },
        {
          onContent: (chunk) => {
            accumulatedContent += chunk

            if (!aiMessageId) {
              const tempAiMessage: Message = {
                id: `temp-ai-${Date.now()}`,
                conversation_id: conversationId,
                user_id: 'default-user',
                role: 'assistant',
                content: accumulatedContent,
                created_at: new Date().toISOString(),
              }
              aiMessageId = tempAiMessage.id
              setStreamingMessageId(aiMessageId)
              setMessages(prev => [...prev, tempAiMessage])
            } else {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg,
                ),
              )
            }
          },
          onDone: async () => {
            setStreamingMessageId(null)
            setIsLoading(false)
            isProcessingRef.current = false
            abortControllerRef.current = null
          },
          onError: (error) => {
            console.error('Streaming error:', error)
            setIsLoading(false)
            setStreamingMessageId(null)
            isProcessingRef.current = false
            abortControllerRef.current = null
          },
        },
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsLoading(false)
      setStreamingMessageId(null)
      isProcessingRef.current = false
      abortControllerRef.current = null
    }
  }

  // 统一的初始化逻辑
  useEffect(() => {
    if (hasInitializedRef.current || !conversationId) return
    hasInitializedRef.current = true

    const initialize = async () => {
      // 检查是否是从新建对话页面跳转过来的
      const initialMessage = sessionStorage.getItem('newChatMessage')
      const storedConvId = sessionStorage.getItem('newConversationId')

      if (initialMessage && storedConvId === conversationId) {
        // 从新建对话页面跳转过来，需要继续流式输出
        sessionStorage.removeItem('newChatMessage')
        sessionStorage.removeItem('newConversationId')

        isProcessingRef.current = true
        setIsLoading(true)

        let aiMessageId: string | null = null
        let accumulatedContent = ''

        // 添加用户消息到UI
        const tempUserMessage: Message = {
          id: `temp-user-${Date.now()}`,
          conversation_id: conversationId,
          user_id: 'default-user',
          role: 'user',
          content: initialMessage,
          created_at: new Date().toISOString(),
        }
        setMessages([tempUserMessage])

        try {
          await chatApi.sendMessageStream(
            {
              conversationId,
              message: initialMessage,
            },
            {
              onContent: (chunk) => {
                accumulatedContent += chunk

                if (!aiMessageId) {
                  const tempAiMessage: Message = {
                    id: `temp-ai-${Date.now()}`,
                    conversation_id: conversationId,
                    user_id: 'default-user',
                    role: 'assistant',
                    content: accumulatedContent,
                    created_at: new Date().toISOString(),
                  }
                  aiMessageId = tempAiMessage.id
                  setStreamingMessageId(aiMessageId)
                  setMessages(prev => [...prev, tempAiMessage])
                } else {
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg,
                    ),
                  )
                }
              },
              onDone: async () => {
                setStreamingMessageId(null)
                setIsLoading(false)
                isProcessingRef.current = false
                abortControllerRef.current = null
              },
              onError: (error) => {
                console.error('Streaming error:', error)
                setIsLoading(false)
                setStreamingMessageId(null)
                isProcessingRef.current = false
                abortControllerRef.current = null
                router.replace('/chat')
              },
            },
          )
        } catch (error) {
          console.error('Failed to continue conversation:', error)
          setIsLoading(false)
          isProcessingRef.current = false
          router.replace('/chat')
        }
      } else {
        // 正常加载现有对话的历史记录
        try {
          setIsLoading(true)
          await loadConversationHistory(conversationId)
        } catch (error) {
          console.error('Failed to load conversation:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    initialize()
  }, [conversationId, router])

  useEffect(() => {
    const fetchTitle = async () => {
      if (!conversationId) return
      try {
        const conversation = await conversationsApi.getById(conversationId)
        if (conversation?.title) {
          setConversationTitle(conversation.title)
        }
      } catch (error) {
        console.error('Failed to load conversation title:', error)
      }
    }

    fetchTitle()
  }, [conversationId])

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleCopyMessage = useCallback(async (message: Message) => {
    if (!message?.content) return

    try {
      await copyTextToClipboard(message.content)
      toast.success('消息内容已复制')
    } catch (error) {
      console.error('Failed to copy message:', error)
      toast.error('复制失败，请重试')
    }
  }, [])

  const handleShareMessage = useCallback(async (message: Message) => {
    if (!message?.content) return

    const sharePayload = {
      title: '来自 Narraverse 的聊天消息',
      text: message.content,
    }

    try {
      if ('share' in navigator && typeof navigator.share === 'function') {
        await navigator.share(sharePayload)
      } else {
        await copyTextToClipboard(message.content)
        toast.success('已复制消息内容，粘贴即可分享')
      }
    } catch (error) {
      console.error('Failed to share message:', error)
      toast.error('分享失败，请稍后再试')
    }
  }, [])

  const handleToggleShareMode = useCallback(() => {
    setIsShareMode((prev) => {
      if (prev) {
        setSelectedMessageIds([])
        return false
      }

      setSelectedMessageIds(messages.map(msg => msg.id))
      return true
    })
  }, [messages])

  const handleToggleSelectMessage = useCallback((messageId: string) => {
    setSelectedMessageIds((prev) => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId)
      }
      return [...prev, messageId]
    })
  }, [])

  const handleCancelShareMode = useCallback(() => {
    setIsShareMode(false)
    setSelectedMessageIds([])
  }, [])

  const handleCopySelectedText = useCallback(async () => {
    if (selectedMessagesForImage.length === 0) {
      toast.error('请先选择要复制的消息')
      return
    }

    const formatted = selectedMessagesForImage
      .map(msg => `${msg.role === 'user' ? '我' : 'AI'}：${msg.content}`)
      .join('\n\n')

    try {
      await copyTextToClipboard(formatted)
      toast.success('对话文本已复制')
    } catch (error) {
      console.error('Failed to copy conversation:', error)
      toast.error('复制失败，请重试')
    }
  }, [selectedMessagesForImage])

  const handleCopyConversationLink = useCallback(async () => {
    if (typeof window === 'undefined') return

    const shareUrl = `${window.location.origin}/chat/${conversationId}`

    try {
      await copyTextToClipboard(shareUrl)
      toast.success('链接已复制')
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('复制链接失败，请重试')
    }
  }, [conversationId])

  const generateShareImage = useCallback(async () => {
    const node = shareImageRef.current
    if (!node) throw new Error('renderer-not-ready')

    const originalLeft = node.style.left
    const originalVisibility = node.style.visibility
    const originalPointerEvents = node.style.pointerEvents
    const originalPosition = node.style.position
    const originalTop = node.style.top

    node.style.left = '0px'
    node.style.visibility = 'visible'
    node.style.pointerEvents = 'auto'
    node.style.position = 'fixed'
    node.style.top = '0px'

    try {
      if (typeof document !== 'undefined' && 'fonts' in document) {
        try {
          await (document as Document & { fonts?: FontFaceSet }).fonts?.ready
        } catch {}
      }

      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
      await new Promise(resolve => setTimeout(resolve, 20))

      const ratio = Math.min(3, Math.max(2, window.devicePixelRatio || 1))
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: ratio, backgroundColor: '#060915' })
      return dataUrl
    } finally {
      node.style.left = originalLeft
      node.style.visibility = originalVisibility
      node.style.pointerEvents = originalPointerEvents
      node.style.position = originalPosition
      node.style.top = originalTop
    }
  }, [])

  const handleGenerateImage = useCallback(async () => {
    if (isGeneratingImage) return
    if (selectedMessagesForImage.length === 0) {
      toast.error('请先选择要生成图片的消息')
      return
    }

    try {
      setIsGeneratingImage(true)
      setPreviewImage(null)
      const dataUrl = await generateShareImage()
      if (!dataUrl) {
        toast.error('生成图片失败，请重试')
        return
      }
      setPreviewImage(dataUrl)
      setIsPreviewVisible(true)
    } catch (error) {
      console.error('Failed to generate image:', error)
      toast.error('生成图片失败，请重试')
    } finally {
      setIsGeneratingImage(false)
    }
  }, [generateShareImage, isGeneratingImage, selectedMessagesForImage])

  const handleDownloadPreview = useCallback(() => {
    if (!previewImage) return
    const link = document.createElement('a')
    link.href = previewImage
    link.download = `narraverse-chat-${Date.now()}.png`
    link.click()
  }, [previewImage])

  const handleEditMessage = useCallback((message: Message) => {
    setEditingMessage(message)
    setShowDocumentEditor(true)
    // 展开右侧面板
    if (rightPanelRef.current && rightPanelRef.current.isCollapsed()) {
      rightPanelRef.current.expand()
    }
  }, [])

  const handleCloseDocumentEditor = useCallback(() => {
    setShowDocumentEditor(false)
    setEditingMessage(null)
    // 折叠右侧面板
    if (rightPanelRef.current && !rightPanelRef.current.isCollapsed()) {
      rightPanelRef.current.collapse()
    }
  }, [])

  const handleSaveDocument = useCallback(async (content: string) => {
    if (!editingMessage) return

    try {
      await messagesApi.update({
        id: editingMessage.id,
        content,
      })
      // 更新本地消息列表
      setMessages(prev =>
        prev.map(msg =>
          msg.id === editingMessage.id ? { ...msg, content } : msg,
        ),
      )
      toast.success('文档已保存')
      handleCloseDocumentEditor()
    } catch (error) {
      console.error('Failed to save document:', error)
      toast.error('保存失败，请重试')
    }
  }, [editingMessage, handleCloseDocumentEditor])

  return (
    <div className="flex flex-col h-full">
      {!showDocumentEditor && (
        <ChatWelcomeHeader
          onShareConversation={handleToggleShareMode}
          isShareMode={isShareMode}
        />
      )}

      {/* 主内容区域：使用 ResizablePanelGroup 支持左右分栏 */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
          autoSaveId="chat-layout"
        >
          {/* 左侧：消息列表 */}
          <ResizablePanel
            id="chat-panel"
            order={1}
            defaultSize={showDocumentEditor ? 60 : 100}
            minSize={40}
          >
            <div className="flex flex-col h-full">
              {/* 消息列表区域 */}
              <div className="flex-1 overflow-hidden">
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  streamingMessageId={streamingMessageId}
                  onCopyMessage={handleCopyMessage}
                  onShareMessage={handleShareMessage}
                  onEditMessage={handleEditMessage}
                  isShareMode={isShareMode}
                  selectedMessageIds={validSelectedMessageIds}
                  onToggleSelectMessage={handleToggleSelectMessage}
                />
              </div>

              {/* 输入框区域 */}
              {isShareMode
                ? (
                    <ShareActionBar
                      selectedCount={validSelectedMessageIds.length}
                      onCancel={handleCancelShareMode}
                      onCopyText={handleCopySelectedText}
                      onCopyLink={handleCopyConversationLink}
                      onGenerateImage={handleGenerateImage}
                      isGeneratingImage={isGeneratingImage}
                    />
                  )
                : (
                    <div className="mb-3">
                      <ChatInputBox
                        onSend={handleSendMessage}
                        disabled={isLoading}
                      />
                    </div>
                  )}
            </div>
          </ResizablePanel>

          {/* 右侧分隔线 */}
          {showDocumentEditor && (
            <>
              <ResizableHandle withHandle />
              {/* 右侧：文档编辑器 */}
              <ResizablePanel
                ref={rightPanelRef}
                id="document-panel"
                order={2}
                defaultSize={40}
                minSize={30}
                maxSize={60}
                collapsible={true}
                collapsedSize={0}
                onCollapse={() => setShowDocumentEditor(false)}
              >
                <DocumentEditor
                  message={editingMessage}
                  isOpen={showDocumentEditor}
                  onClose={handleCloseDocumentEditor}
                  onSave={handleSaveDocument}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      <ShareImageRenderer
        containerRef={shareImageRef}
        messages={selectedMessagesForImage}
        title={conversationTitle}
      />

      <ShareImagePreviewDialog
        open={isPreviewVisible}
        onOpenChange={setIsPreviewVisible}
        imageUrl={previewImage}
        isLoading={isGeneratingImage && !previewImage}
        onDownload={handleDownloadPreview}
      />
    </div>
  )
}

interface ShareActionBarProps {
  selectedCount: number
  onCancel: () => void
  onCopyText: () => void
  onCopyLink: () => void
  onGenerateImage: () => void
  isGeneratingImage: boolean
}

function ShareActionBar({
  selectedCount,
  onCancel,
  onCopyText,
  onCopyLink,
  onGenerateImage,
  isGeneratingImage,
}: ShareActionBarProps) {
  return (
    <div className="border-t bg-background px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            已选中
            {selectedCount}
            {' '}
            条对话
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
            <span>取消</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3"
            onClick={onCopyText}
          >
            <Copy className="w-4 h-4" />
            <span>复制文本</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3"
            onClick={onCopyLink}
          >
            <Link2 className="w-4 h-4" />
            <span>复制链接</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3"
            onClick={onGenerateImage}
            disabled={isGeneratingImage || selectedCount === 0}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isGeneratingImage ? '生成中...' : '生成图片'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ShareImagePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string | null
  isLoading: boolean
  onDownload: () => void
}

function ShareImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  isLoading,
  onDownload,
}: ShareImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[calc(100%-2rem)] bg-[#0B0F1A] text-white border-white/10 shadow-[0_40px_120px_rgba(6,9,21,0.55)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-wide">预览</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-auto rounded-2xl bg-[#060915] p-4">
          {imageUrl
            ? (
                <img
                  src={imageUrl}
                  alt="对话分享图片预览"
                  className="w-full rounded-[28px] shadow-[0_30px_80px_rgba(6,9,21,0.6)] border border-white/5"
                />
              )
            : (
                <div className="h-[360px] flex items-center justify-center text-white/60 text-sm rounded-[28px] border border-dashed border-white/10">
                  {isLoading ? '图片生成中...' : '暂无可预览的内容'}
                </div>
              )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            关闭
          </Button>
          <Button
            onClick={onDownload}
            disabled={!imageUrl}
            className="bg-white text-[#0B0F1A] hover:bg-white/90"
          >
            下载图片
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
