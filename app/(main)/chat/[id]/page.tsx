'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo } from 'react'

import { ChatInputBox } from '../_components/chat-input-box'
import { ChatWelcomeHeader } from '../_components/chat-welcome-header'
import { DocumentEditorDialog } from './_components/document-editor-dialog'
import { MessageList } from './_components/message-list'
import { ShareActionBar } from './_components/share-action-bar'
import { ShareImagePreviewDialog } from './_components/share-image-preview-dialog'
import { ShareImageRenderer } from './_components/share-image-renderer'
import { useConversationMessages } from './_hooks/use-conversation-messages'
import { useDocumentEditor } from './_hooks/use-document-editor'
import { useImageGeneration } from './_hooks/use-image-generation'
import { useShareMode } from './_hooks/use-share-mode'

function ConversationContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const conversationId = params.id as string
  const initialMessage = searchParams.get('message') || undefined
  const isNewConversation = !!initialMessage

  const {
    messages,
    setMessages,
    isLoading,
    streamingMessageId,
    conversationTitle,
    latestAssistantMessage,
    handleSendMessage,
    handleCopyMessage,
    handleShareMessage,
  } = useConversationMessages({ conversationId, initialMessage, isNewConversation })

  useEffect(() => {
    if (initialMessage && messages.length > 1) {
      router.replace(`/chat/${conversationId}`, { scroll: false })
    }
  }, [initialMessage, messages, conversationId, router])

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

  const handleMessageUpdate = useCallback((id: string, content: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, content } : msg,
      ),
    )
  }, [setMessages])

  const {
    editingMessage,
    showDocumentEditor,
    setShowDocumentEditor,
    handleEditMessage: originalHandleEditMessage,
    handleCloseDocumentEditor,
    handleSaveDocument,
  } = useDocumentEditor(handleMessageUpdate)

  const handleEditMessage = useCallback((message) => {
    originalHandleEditMessage(message)
  }, [originalHandleEditMessage])

  const displayLatestAssistantMessage = useMemo(() => {
    if (!showDocumentEditor) return null
    return latestAssistantMessage
  }, [latestAssistantMessage, showDocumentEditor])

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
              onEditMessage={handleEditMessage}
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
                  />
                </div>
              )}
        </div>
      </div>

      <DocumentEditorDialog
        message={editingMessage}
        latestAssistantMessage={displayLatestAssistantMessage}
        open={showDocumentEditor}
        onOpenChange={setShowDocumentEditor}
        onSave={handleSaveDocument}
      />

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

export default function ConversationPage() {
  return (
    <Suspense fallback={null}>
      <ConversationContent />
    </Suspense>
  )
}
