'use client'

import { useParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store'
import { ChatInputBox } from '../_components/chat-input-box'
import { ChatWelcomeHeader } from '../_components/chat-welcome-header'
import { MessageList } from './_components/message-list'
import { ShareActionBar } from './_components/share-action-bar'
import { ShareImagePreviewDialog } from './_components/share-image-preview-dialog'
import { ShareImageRenderer } from './_components/share-image-renderer'
import { useChatConversation } from './_hooks/use-chat-conversation'
import { useImageGeneration } from './_hooks/use-image-generation'
import { useShareMode } from './_hooks/use-share-mode'

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params.id as string

  const consumePendingDraftMessage = useAppStore(s => s.chatActions.consumePendingDraftMessage)

  const {
    messages,
    isLoading,
    streamingMessageId,
    conversationTitle,
    handleSendMessage,
    handleCopyMessage,
    handleShareMessage,
  } = useChatConversation({ conversationId })

  // 欢迎页跳转过来时会预先把首条消息塞进 zustand；这里一次性消费并自动发送。
  const consumedKeyRef = useRef<string | null>(null)
  const handleSendMessageRef = useRef(handleSendMessage)
  handleSendMessageRef.current = handleSendMessage

  useEffect(() => {
    if (consumedKeyRef.current === conversationId) return
    const pending = consumePendingDraftMessage()
    if (!pending) return
    consumedKeyRef.current = conversationId
    void handleSendMessageRef.current(pending)
  }, [conversationId, consumePendingDraftMessage])

  const {
    isShareMode,
    selectedMessageIds,
    selectedMessages,
    handleToggleShareMode,
    handleToggleSelectMessage,
    handleCancelShareMode,
    handleCopySelectedText,
    handleCopyConversationLink,
  } = useShareMode(messages, conversationId)

  const {
    shareImageRef,
    isGeneratingImage,
    previewImage,
    isPreviewVisible,
    setIsPreviewVisible,
    handleGenerateImage,
    handleDownloadPreview,
  } = useImageGeneration(selectedMessages)

  return (
    <div className="flex flex-col h-full">
      <ChatWelcomeHeader
        onShareConversation={handleToggleShareMode}
        isShareMode={isShareMode}
      />

      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              streamingMessageId={streamingMessageId}
              onCopyMessage={handleCopyMessage}
              onShareMessage={handleShareMessage}
              isShareMode={isShareMode}
              selectedMessageIds={selectedMessageIds}
              onToggleSelectMessage={handleToggleSelectMessage}
            />
          </div>

          {isShareMode
            ? (
                <ShareActionBar
                  selectedCount={selectedMessageIds.length}
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
                    centered
                  />
                </div>
              )}
        </div>
      </div>

      <ShareImageRenderer
        containerRef={shareImageRef}
        messages={selectedMessages}
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
