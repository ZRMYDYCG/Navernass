'use client'

import { useParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ChatInputBox } from '../_components/chat-input-box'
import { ChatWelcomeHeader } from '../_components/chat-welcome-header'
import { DocumentEditor } from './_components/document-editor'
import { MessageList } from './_components/message-list'
import { ShareActionBar } from './_components/share-action-bar'
import { ShareImagePreviewDialog } from './_components/share-image-preview-dialog'
import { ShareImageRenderer } from './_components/share-image-renderer'
import { useConversationMessages } from './_hooks/use-conversation-messages'
import { useDocumentEditor } from './_hooks/use-document-editor'
import { useImageGeneration } from './_hooks/use-image-generation'
import { useShareMode } from './_hooks/use-share-mode'
import { useChatSidebar } from '../_components/chat-sidebar-provider'

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params.id as string
  const { close: closeSidebar } = useChatSidebar()

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
  } = useConversationMessages(conversationId)

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
    rightPanelRef,
    handleEditMessage: originalHandleEditMessage,
    handleCloseDocumentEditor,
    handleSaveDocument,
  } = useDocumentEditor(handleMessageUpdate)

  const handleEditMessage = useCallback((message) => {
    closeSidebar()
    originalHandleEditMessage(message)
  }, [closeSidebar, originalHandleEditMessage])

  const displayLatestAssistantMessage = useMemo(() => {
    if (!showDocumentEditor) return null
    return latestAssistantMessage
  }, [latestAssistantMessage, showDocumentEditor])

  return (
    <div className="flex flex-col h-full">
      {!showDocumentEditor && (
        <ChatWelcomeHeader
          onShareConversation={handleToggleShareMode}
          isShareMode={isShareMode}
        />
      )}

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
          autoSaveId="chat-layout"
        >
          <ResizablePanel
            id="chat-panel"
            order={1}
            defaultSize={showDocumentEditor ? 60 : 100}
            minSize={40}
          >
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
          </ResizablePanel>

          {showDocumentEditor && (
            <>
              <ResizableHandle withHandle />
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
                  latestAssistantMessage={displayLatestAssistantMessage}
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
