'use client'

import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store'
import { ChatWelcomeHeader } from '../_components/chat-welcome-header'
import { ChatActionsWrapper } from './_components/chat-actions-wrapper'
import { ChatAgentInput } from './_components/chat-agent-input'
import { ChatMessageList } from './_components/chat-message-list'
import { MessageList } from './_components/message-list'
import { ShareActionBar } from './_components/share-action-bar'
import { ShareImagePreviewDialog } from './_components/share-image-preview-dialog'
import { ShareImageRenderer } from './_components/share-image-renderer'
import { ChatAgentActionsProvider } from './_hooks/chat-agent-actions-context'
import { useChatAgent } from './_hooks/use-chat-agent'
import { useImageGeneration } from './_hooks/use-image-generation'
import { useShareMode } from './_hooks/use-share-mode'

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params.id as string

  const consumePendingDraftMessage = useAppStore(s => s.chatActions.consumePendingDraftMessage)

  const agent = useChatAgent({ conversationId })

  // 欢迎页跳转过来时会预先把首条消息塞进 zustand；这里一次性消费并自动发送。
  const consumedKeyRef = useRef<string | null>(null)
  const handleSendMessageRef = useRef(agent.handleSendMessage)
  handleSendMessageRef.current = agent.handleSendMessage

  useEffect(() => {
    if (consumedKeyRef.current === conversationId) return
    const pending = consumePendingDraftMessage()
    if (!pending) return
    consumedKeyRef.current = conversationId
    void handleSendMessageRef.current(pending)
  }, [conversationId, consumePendingDraftMessage])

  // 分享模式（独立 useChatConversation 视图片段选择）— 维持原 useShareMode + useImageGeneration 逻辑
  // 这里从 agent.messages 派生 selectedMessages 列表
  const {
    isShareMode,
    selectedMessageIds,
    selectedMessages,
    handleToggleShareMode,
    handleToggleSelectMessage,
    handleCancelShareMode,
    handleCopySelectedText,
    handleCopyConversationLink,
  } = useShareMode(agent.messages, conversationId)

  const {
    shareImageRef,
    isGeneratingImage,
    previewImage,
    isPreviewVisible,
    setIsPreviewVisible,
    handleGenerateImage,
    handleDownloadPreview,
  } = useImageGeneration(selectedMessages)

  // 输入框本地态
  const [input, setInput] = useState('')
  const handleInputChange = (value: string) => setInput(value)
  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    await agent.handleSendMessage(text)
  }

  const agentActionsValue = {
    acceptNovelProposal: agent.acceptNovelProposal,
    acceptCharacterProposal: agent.acceptCharacterProposal,
    acceptOutlineProposal: agent.acceptOutlineProposal,
    rejectProposal: agent.rejectProposal,
    markFormSubmitted: agent.markFormSubmitted,
  }

  return (
    <div className="flex flex-col h-full">
      <ChatWelcomeHeader
        onShareConversation={handleToggleShareMode}
        isShareMode={isShareMode}
      />

      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            {isShareMode
              ? (
                  <MessageList
                    messages={agent.messages}
                    isLoading={agent.isLoading}
                    streamingMessageId={agent.streamingMessageId}
                    onCopyMessage={agent.handleCopyMessage}
                    onShareMessage={agent.handleShareMessage}
                    isShareMode={isShareMode}
                    selectedMessageIds={selectedMessageIds}
                    onToggleSelectMessage={handleToggleSelectMessage}
                  />
                )
              : (
                  <ChatActionsWrapper
                    isLoading={agent.isLoading}
                    onSend={agent.handleSendMessage}
                    messages={agent.messages}
                    markFormSubmitted={agent.markFormSubmitted}
                  >
                    <ChatAgentActionsProvider value={agentActionsValue}>
                      <ChatMessageList
                        messages={agent.messages}
                        isLoading={agent.isLoading}
                        streamingMessageId={agent.streamingMessageId}
                        onCopyMessage={agent.handleCopyMessage}
                        onShareMessage={agent.handleShareMessage}
                      />
                    </ChatAgentActionsProvider>
                  </ChatActionsWrapper>
                )}
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
                <div className="mb-3 px-4 sm:px-6">
                  <ChatAgentInput
                    value={input}
                    onChange={handleInputChange}
                    onSend={handleSend}
                    mode={agent.mode}
                    model={agent.model}
                    onModeChange={agent.setMode}
                    onModelChange={agent.setModel}
                    disabled={agent.isLoading}
                    isSending={agent.isLoading}
                    centered
                  />
                </div>
              )}
        </div>
      </div>

      <ShareImageRenderer
        containerRef={shareImageRef}
        messages={selectedMessages}
        title={agent.conversationTitle}
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
