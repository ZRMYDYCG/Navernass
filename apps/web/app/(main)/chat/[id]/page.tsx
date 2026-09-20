'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildUserComposerMessage } from '@/lib/editor/composer-message'
import { hasComposerContent } from '@/lib/editor/inline-composer'
import { useChatStore } from '@/store'
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
import { useChatMentions } from './_hooks/use-chat-mentions'
import { useImageGeneration } from './_hooks/use-image-generation'
import { useShareMode } from './_hooks/use-share-mode'

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params.id as string

  const consumePendingDraftMessage = useChatStore(s => s.chatActions.consumePendingDraftMessage)

  // 拉全部书本 + 角色，提供给 picker；mentionsRef 桥接 sendMessage 时的选中 id
  const mentions = useChatMentions()
  const mentionsRef = useRef({ bookIds: [] as string[], characterIds: [] as string[] })
  const setMentionsRef = useCallback((next: { bookIds: string[], characterIds: string[] }) => {
    mentionsRef.current = next
  }, [])

  const agent = useChatAgent({ conversationId, mentionsRef })
  const { handleSendMessage } = agent

  // 欢迎页跳转过来时会预先把首条消息塞进 zustand；这里一次性消费并自动发送。
  const consumedKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (consumedKeyRef.current === conversationId) return
    const pending = consumePendingDraftMessage()
    if (!pending) return
    consumedKeyRef.current = conversationId
    void handleSendMessage(pending)
  }, [conversationId, consumePendingDraftMessage, handleSendMessage])

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
    if (!hasComposerContent(input)) return
    // 解析 composer 序列化为 parts（含 data-book-ref / data-character-ref chip part）
    // 用 mentions.books/characters 补全 title（chip 的 title/id 已就绪）
    const payload = buildUserComposerMessage(
      input,
      [],
      mentions.characters,
      [],
      [],
    )
    // 用 page 持有的最新 book list 补全 title（bookId 可能只来自 ref）
    const enrichedBooks = payload.books.map((b) => {
      const found = mentions.books.find(mb => mb.id === b.id)
      return found ? { id: found.id, title: found.title } : b
    })
    setMentionsRef({
      bookIds: enrichedBooks.map(b => b.id),
      characterIds: payload.characters.map(c => c.id),
    })
    setInput('')
    // transport 在 sendMessage 期间同步读取 mentionsRef；send 完成后清空
    await agent.handleSendMessage({
      text: payload.plainText,
      parts: payload.parts,
    })
    setMentionsRef({ bookIds: [], characterIds: [] })
  }

  // 同步 ref：内联 composer 通过回调更新 selection（仅在 send 前保持 fallback 一致）
  const handleBooksChange = useCallback((next: { id: string, title: string }[]) => {
    setMentionsRef({
      bookIds: next.map(b => b.id),
      characterIds: mentionsRef.current.characterIds,
    })
  }, [setMentionsRef])
  const handleCharactersChange = useCallback((next: { id: string, name: string }[]) => {
    setMentionsRef({
      bookIds: mentionsRef.current.bookIds,
      characterIds: next.map(c => c.id),
    })
  }, [setMentionsRef])

  const agentActionsValue = useMemo(() => ({
    acceptNovelProposal: agent.acceptNovelProposal,
    acceptCharacterProposal: agent.acceptCharacterProposal,
    acceptOutlineProposal: agent.acceptOutlineProposal,
    rejectProposal: agent.rejectProposal,
    markFormSubmitted: agent.markFormSubmitted,
  }), [agent])

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
                    books={mentions.books}
                    characters={mentions.characters}
                    onBooksChange={handleBooksChange}
                    onCharactersChange={handleCharactersChange}
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
